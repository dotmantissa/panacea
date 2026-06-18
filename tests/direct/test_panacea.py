import json

def test_analyze_prescription(direct_vm, direct_deploy, direct_alice):
    # Deploy contract using the cached v0.2.12 SDK
    contract = direct_deploy("contracts/panacea.py", sdk_version="v0.2.12")
    direct_vm.sender = direct_alice

    # Mock FDA API web request
    direct_vm.mock_web(
        r".*api\.fda\.gov/drug/label.*",
        {
            "status": 200,
            "body": json.dumps({
                "results": [
                    {
                        "indications_and_usage": ["Standard treatment for pain and inflammation."],
                        "dosage_and_administration": ["Take 200-400mg every 4 to 6 hours as needed."],
                        "warnings": ["May cause stomach bleeding or cardiovascular risks."],
                        "drug_interactions": ["Do not take with other NSAIDs or anticoagulants."]
                    }
                ]
            })
        }
    )

    # Mock LLM response
    mock_briefing = {
        "is_appropriate": "standard",
        "is_appropriate_reason": "Ibuprofen is indeed a standard first-line treatment for acute back pain and inflammation.",
        "dosage_check": "appropriate",
        "dosage_check_reason": "400mg is a standard adult dosage for mild to moderate pain.",
        "interactions": "none",
        "interactions_reason": "No severe interactions found with your empty medication list, but watch out for stomach sensitivity.",
        "questions": [
            "Should I take this with food to prevent stomach irritation?",
            "How many days should I continue this treatment?",
            "Can I combine this with acetaminophen if the pain spikes?"
        ],
        "summary": "Everything looks standard. Ibuprofen is standard for back pain at this dosage. Take with food and avoid combining with other NSAIDs."
    }

    direct_vm.mock_llm(
        r".*Analyze this prescription.*",
        json.dumps(mock_briefing)
    )

    profile = json.dumps({
        "age": 35,
        "weight": 75,
        "other_medications": "none",
        "allergies": "none"
    })

    # Call write method to analyze
    result = contract.analyze_prescription(
        "analysis_1",
        str(direct_alice),
        "Ibuprofen",
        "400mg twice daily",
        "Acute back pain",
        profile,
        "2026-06-18T19:30:00Z"
    )

    # Decode and check
    briefing = json.loads(result)
    assert briefing["is_appropriate"] == "standard"
    assert briefing["dosage_check"] == "appropriate"
    assert briefing["interactions"] == "none"
    assert len(briefing["questions"]) == 3

    # Verify view method works
    stored = contract.get_analysis("analysis_1")
    assert stored["id"] == "analysis_1"
    assert stored["user_address"] == str(direct_alice)
    assert stored["drug_name"] == "Ibuprofen"
    assert json.loads(stored["result_json"])["is_appropriate"] == "standard"
