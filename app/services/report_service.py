from app.core.exceptions import FinEconError


def get_report(db, task_id):
    _, report = db.get(task_id)
    if report is None:
        raise FinEconError("Report is not available", "report_unavailable", 409)
    return report
