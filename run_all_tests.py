import subprocess
import sys
import time

TEST_MODULES = [
    ("Zero-Trust Security Adversarial Penetration Suite (11 Tests)", "backend.tests.test_security_adversarial"),
    ("Full E2E Operational Mission Scenario (14 Steps)", "backend.tests.test_e2e_scenario"),
    ("AI Mahalanobis Anomaly & Predictive Maintenance", "backend.tests.test_ai_anomaly"),
    ("Coupled Thermodynamics & Physics Engine", "backend.tests.test_physics"),
    ("What-If Emergency Simulation Scenarios", "backend.tests.test_simulation_scenarios"),
    ("Rugged Edge Store-and-Forward Replay & CRC32", "backend.tests.test_edge_offline"),
    ("Full-Stack Master System Integration Suite (17 Tests)", "backend.tests.test_full_system_integration"),
    ("Data Engineering Core & ML Acceptance Suite (70 Tests)", "LLM.tests.test_master_data_pipeline")
]

def main():
    print("=" * 80)
    print("       POLAR-TWIN MASTER TEST SUITE EXECUTION & VERIFICATION")
    print("  POLAR-TWIN — Digital Platform for Remote Antarctic Station Operations")
    print("  National Centre for Polar and Ocean Research (NCPOR), MoES, India")
    print("=" * 80 + "\n")

    total_start = time.time()
    passed_count = 0
    failed_count = 0
    results = []

    for name, module in TEST_MODULES:
        print(f"[*] Running: {name} ({module})...")
        t0 = time.time()
        res = subprocess.run([sys.executable, "-m", module], capture_output=True, text=True)
        elapsed = round(time.time() - t0, 2)
        if res.returncode == 0:
            print(f"    --> PASSED in {elapsed}s\n")
            passed_count += 1
            results.append((name, "PASSED", elapsed, ""))
        else:
            print(f"    --> FAILED in {elapsed}s")
            err_snippet = res.stderr[-500:] if res.stderr else res.stdout[-500:]
            print(f"    Error: {err_snippet}\n")
            failed_count += 1
            results.append((name, "FAILED", elapsed, err_snippet))

    total_elapsed = round(time.time() - total_start, 2)

    print("=" * 80)
    print("                         SUMMARY OF TEST RESULTS")
    print("=" * 80)
    for name, status, elapsed, err in results:
        status_icon = "✓ [PASS]" if status == "PASSED" else "✗ [FAIL]"
        print(f"{status_icon:<10} | {elapsed:>5.2f}s | {name}")
    print("-" * 80)
    print(f"TOTAL: {passed_count}/{len(TEST_MODULES)} SUITES PASSED ({passed_count/len(TEST_MODULES)*100:.1f}%) in {total_elapsed}s")
    print("=" * 80 + "\n")

    if failed_count > 0:
        sys.exit(1)

if __name__ == "__main__":
    main()
