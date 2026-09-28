from backend.edge.edge_node import AntarcticEdgeStationNode

def test_edge_offline_buffering_and_crc():
    node = AntarcticEdgeStationNode("station_bharati", "edge_node_bharati")
    assert node.link_status == "ONLINE"

    # Simulate link failure -> OFFLINE
    node.set_link_status("OFFLINE")
    assert node.link_status == "OFFLINE"

    # Ingest 3 telemetry readings while disconnected
    r1 = node.ingest_telemetry_reading("vibration_mms", 4.95, "mm/s", "bh_gen_01")
    r2 = node.ingest_telemetry_reading("exhaust_temp_c", 470.0, "°C", "bh_gen_01")
    r3 = node.ingest_telemetry_reading("oil_pressure_bar", 3.2, "bar", "bh_gen_01")

    assert len(node.local_buffer) == 3
    assert r1["sequence_number"] < r2["sequence_number"] < r3["sequence_number"]
    assert r1["crc32"] is not None

    # Verify local edge rule engine triggered local alerts even while offline
    assert len(node.local_alerts) >= 2

    # Simulate link restored -> SYNC
    sync_res = node.trigger_reconnection_sync()
    assert sync_res["status"] == "COMPLETED"
    assert sync_res["records_synced"] == 3
    assert sync_res["crc_verified"] is True
    assert len(node.local_buffer) == 0
    assert node.link_status == "ONLINE"

if __name__ == "__main__":
    test_edge_offline_buffering_and_crc()
    print("All Edge offline buffering and store-and-forward replay tests passed!")
