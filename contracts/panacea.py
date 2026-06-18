# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

from genlayer import *
from dataclasses import dataclass
import json

@allow_storage
@dataclass
class AnalysisRecord:
    id: str
    user_address: str
    drug_name: str
    dosage: str
    diagnosis: str
    profile_json: str
    result_json: str
    created_at: str

class Panacea(gl.Contract):
    owner: Address
    analyses: TreeMap[str, AnalysisRecord]
    analysis_ids: DynArray[str]

    def __init__(self):
        self.owner = gl.message.sender_address

    @gl.public.write
    def analyze_prescription(self, analysis_id: str, user_addr: str, drug_name: str, dosage: str, diagnosis: str, profile_json: str, timestamp_str: str) -> str:
        # Run nondeterministic check with equivalence consensus
        def leader_fn():
            fda_data = None
            try:
                # URL escape spaces for openFDA
                escaped_drug = drug_name.replace(" ", "%20")
                url = f"https://api.fda.gov/drug/label.json?search=openfda.brand_name:\"{escaped_drug}\"+OR+openfda.generic_name:\"{escaped_drug}\"&limit=1"
                res = gl.nondet.web.get(url)
                if res.status == 200:
                    fda_data = json.loads(res.body.decode("utf-8"))
            except Exception:
                pass

            fda_context = ""
            if fda_data and "results" in fda_data and len(fda_data["results"]) > 0:
                result_item = fda_data["results"][0]
                indications = result_item.get("indications_and_usage", [""])[0]
                dosage_admin = result_item.get("dosage_and_administration", [""])[0]
                warnings = result_item.get("warnings", [""])[0]
                interactions = result_item.get("drug_interactions", [""])[0]
                fda_context = f"FDA Labeling Info:\n- Indications: {indications[:600]}\n- Dosage: {dosage_admin[:600]}\n- Warnings: {warnings[:600]}\n- Interactions: {interactions[:600]}"

            prompt = f"""
You are a highly experienced clinical pharmacist providing a warm, plain-English medical second opinion briefing.
Analyze this prescription:
- Patient Profile: {profile_json}
- Drug: {drug_name}
- Dosage: {dosage}
- Diagnosis/Condition: {diagnosis}

{fda_context}

Evaluate:
1. Is this drug standard/appropriate for the diagnosed condition? (options: "standard", "non-standard", "uncertain")
2. Is the dosage appropriate based on their age, weight, and other medications? (options: "appropriate", "inappropriate", "uncertain")
3. Are there potential interactions with their current medications or profile? (options: "none", "moderate", "severe")
4. What are the key questions the patient should ask their doctor?

Provide a human-sounding response. Do NOT use dry clinical lists, robotic warnings, AI hyphens, or generic disclaimers. Speak directly to the patient with empathy and clear guidance.

Return strictly a JSON object:
{{
  "is_appropriate": "standard" | "non-standard" | "uncertain",
  "is_appropriate_reason": "Direct, plain-English explanation of why this treatment is or is not standard.",
  "dosage_check": "appropriate" | "inappropriate" | "uncertain",
  "dosage_check_reason": "Friendly explanation checking their age/weight/other meds against the dosage.",
  "interactions": "none" | "moderate" | "severe",
  "interactions_reason": "Clear review of any dangerous combinations or profile issues.",
  "questions": [
    "Crucial question 1 about their side effects or alternatives",
    "Crucial question 2 about timing or interactions",
    "Crucial question 3 about the treatment length"
  ],
  "summary": "A warm, comforting but realistic summary of their briefing."
}}
"""
            analysis_res = gl.nondet.exec_prompt(prompt, response_format="json")
            return json.dumps(analysis_res)

        def validator_fn(leaders_res: gl.vm.Result) -> bool:
            if not isinstance(leaders_res, gl.vm.Return):
                try:
                    leader_fn()
                    return False
                except Exception:
                    return True

            try:
                validator_res_str = leader_fn()
            except Exception:
                return False

            try:
                leader_data = json.loads(leaders_res.calldata)
                val_data = json.loads(validator_res_str)

                # Normalize categories
                l_app = str(leader_data.get("is_appropriate", "")).strip().lower()
                v_app = str(val_data.get("is_appropriate", "")).strip().lower()

                l_dos = str(leader_data.get("dosage_check", "")).strip().lower()
                v_dos = str(val_data.get("dosage_check", "")).strip().lower()

                l_int = str(leader_data.get("interactions", "")).strip().lower()
                v_int = str(val_data.get("interactions", "")).strip().lower()

                # Equivalence comparison on the core classification decisions
                if l_app != v_app or l_dos != v_dos or l_int != v_int:
                    return False

                return True
            except Exception:
                return False

        # Run on-chain consensus
        result_json = gl.vm.run_nondet_unsafe(leader_fn, validator_fn)

        # Record the result in storage
        record = AnalysisRecord(
            id=analysis_id,
            user_address=user_addr,
            drug_name=drug_name,
            dosage=dosage,
            diagnosis=diagnosis,
            profile_json=profile_json,
            result_json=result_json,
            created_at=timestamp_str
        )
        self.analyses[analysis_id] = record
        self.analysis_ids.append(analysis_id)

        return result_json

    @gl.public.view
    def get_analysis(self, analysis_id: str) -> dict:
        record = self.analyses[analysis_id]
        return {
            "id": record.id,
            "user_address": record.user_address,
            "drug_name": record.drug_name,
            "dosage": record.dosage,
            "diagnosis": record.diagnosis,
            "profile_json": record.profile_json,
            "result_json": record.result_json,
            "created_at": record.created_at
        }
