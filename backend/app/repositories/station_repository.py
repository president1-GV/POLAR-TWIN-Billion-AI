from typing import List, Optional, Dict, Any
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import desc, func

from backend.app.models.models import (
    Station, Asset, Telemetry, WeatherObservation,
    EnergyMeasurement, LogisticsRecord, Alert, AuditLog
)
from backend.app.repositories.base_repository import BaseRepository


class StationRepository(BaseRepository[Station]):
    def __init__(self, db: Session):
        super().__init__(Station, db)

    def get_by_code(self, code: str) -> Optional[Station]:
        return self.db.query(Station).filter(Station.station_code == code).first()


class AssetRepository(BaseRepository[Asset]):
    def __init__(self, db: Session):
        super().__init__(Asset, db)

    def get_by_station(self, station_id: str) -> List[Asset]:
        return self.db.query(Asset).filter(Asset.station_id == station_id).all()

    def get_by_code(self, code: str) -> Optional[Asset]:
        return self.db.query(Asset).filter(Asset.code == code).first()


class TelemetryRepository(BaseRepository[Telemetry]):
    def __init__(self, db: Session):
        super().__init__(Telemetry, db)

    def get_latest_by_asset(self, asset_id: str, metric: str) -> Optional[Telemetry]:
        return (
            self.db.query(Telemetry)
            .filter(Telemetry.asset_id == asset_id, Telemetry.metric == metric)
            .order_by(desc(Telemetry.timestamp))
            .first()
        )

    def get_time_window(
        self,
        station_id: str,
        asset_id: str,
        metric: str,
        start_time: datetime,
        end_time: datetime,
        limit: int = 500
    ) -> List[Telemetry]:
        return (
            self.db.query(Telemetry)
            .filter(
                Telemetry.station_id == station_id,
                Telemetry.asset_id == asset_id,
                Telemetry.metric == metric,
                Telemetry.timestamp >= start_time,
                Telemetry.timestamp <= end_time,
            )
            .order_by(Telemetry.timestamp.asc())
            .limit(limit)
            .all()
        )


class WeatherRepository(BaseRepository[WeatherObservation]):
    def __init__(self, db: Session):
        super().__init__(WeatherObservation, db)

    def get_latest(self, station_id: str) -> Optional[WeatherObservation]:
        return (
            self.db.query(WeatherObservation)
            .filter(WeatherObservation.station_id == station_id)
            .order_by(desc(WeatherObservation.timestamp))
            .first()
        )


class EnergyRepository(BaseRepository[EnergyMeasurement]):
    def __init__(self, db: Session):
        super().__init__(EnergyMeasurement, db)

    def get_latest(self, station_id: str) -> Optional[EnergyMeasurement]:
        return (
            self.db.query(EnergyMeasurement)
            .filter(EnergyMeasurement.station_id == station_id)
            .order_by(desc(EnergyMeasurement.timestamp))
            .first()
        )


class LogisticsRepository(BaseRepository[LogisticsRecord]):
    def __init__(self, db: Session):
        super().__init__(LogisticsRecord, db)

    def get_by_station(self, station_id: str) -> List[LogisticsRecord]:
        return self.db.query(LogisticsRecord).filter(LogisticsRecord.station_id == station_id).all()


class AlertRepository(BaseRepository[Alert]):
    def __init__(self, db: Session):
        super().__init__(Alert, db)

    def get_active_by_station(self, station_id: str) -> List[Alert]:
        return (
            self.db.query(Alert)
            .filter(Alert.station_id == station_id, Alert.status == "ACTIVE")
            .order_by(desc(Alert.created_at))
            .all()
        )


class AuditRepository(BaseRepository[AuditLog]):
    def __init__(self, db: Session):
        super().__init__(AuditLog, db)

    def log_action(
        self,
        user_id: str,
        role: str,
        action: str,
        resource: str,
        station_id: Optional[str] = None,
        before_state: Optional[Dict[str, Any]] = None,
        after_state: Optional[Dict[str, Any]] = None,
        details: Optional[Dict[str, Any]] = None,
        client_ip: Optional[str] = None,
        request_id: Optional[str] = None
    ) -> AuditLog:
        return self.create({
            "request_id": request_id,
            "user_id": user_id,
            "role": role,
            "station_id": station_id,
            "action": action,
            "resource": resource,
            "before_state": before_state,
            "after_state": after_state,
            "details": details or {},
            "client_ip": client_ip,
            "source": "API_GATEWAY"
        })
