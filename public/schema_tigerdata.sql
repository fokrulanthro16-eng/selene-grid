CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE;

CREATE TABLE IF NOT EXISTS selene_grid_telemetry (
    time TIMESTAMPTZ NOT NULL,
    datacenter_id VARCHAR(64) NOT NULL,
    carbon_intensity DOUBLE PRECISION NOT NULL,
    pue DOUBLE PRECISION NOT NULL,
    gpu_temperature DOUBLE PRECISION NOT NULL,
    flops_throughput DOUBLE PRECISION NOT NULL,
    avoided_carbon_grams DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    optical_uplink_active BOOLEAN NOT NULL DEFAULT FALSE
);

SELECT create_hypertable('selene_grid_telemetry', 'time', if_not_exists => TRUE);

CREATE INDEX IF NOT EXISTS idx_selene_dc_time ON selene_grid_telemetry (datacenter_id, time DESC);

CREATE MATERIALIZED VIEW IF NOT EXISTS selene_one_minute_rollup
WITH (timescaledb.continuous) AS
SELECT 
    time_bucket('1 minute', time) AS window_start,
    datacenter_id,
    AVG(carbon_intensity) AS avg_carbon_intensity,
    AVG(pue) AS avg_pue,
    MAX(gpu_temperature) AS max_gpu_temp,
    SUM(avoided_carbon_grams) AS total_avoided_carbon
FROM selene_grid_telemetry
GROUP BY window_start, datacenter_id;

SELECT add_continuous_aggregate_policy('selene_one_minute_rollup',
    start_offset => INTERVAL '1 hour',
    end_offset => INTERVAL '1 minute',
    schedule_interval => INTERVAL '1 minute');

INSERT INTO selene_grid_telemetry (time, datacenter_id, carbon_intensity, pue, gpu_temperature, flops_throughput, avoided_carbon_grams, optical_uplink_active)
VALUES 
    (NOW() - INTERVAL '5 minutes', 'us-east-1-virginia', 442.0, 1.48, 74.0, 840.5, 0.0, FALSE),
    (NOW() - INTERVAL '4 minutes', 'us-east-1-virginia', 445.0, 1.49, 75.0, 845.0, 0.0, FALSE),
    (NOW() - INTERVAL '3 minutes', 'lunar-shackleton-1', 0.0, 0.00, -250.0, 1200.0, 420.5, TRUE),
    (NOW() - INTERVAL '2 minutes', 'lunar-shackleton-1', 0.0, 0.00, -250.0, 1200.0, 430.0, TRUE),
    (NOW(), 'lunar-shackleton-1', 0.0, 0.00, -250.0, 1200.0, 425.0, TRUE);
