from app.data.validator import validate_data
from app.schemas.analysis import DescriptiveRequest

DATA_TOOLS = {"validate_data": (DescriptiveRequest, validate_data)}
