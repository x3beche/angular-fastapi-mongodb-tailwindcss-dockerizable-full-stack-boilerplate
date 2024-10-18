import os
import yaml
from models.utils import Config

config: Config
config_json: dict
with open("config.yaml") as f:
    config_json = yaml.load(f, Loader=yaml.FullLoader)
    config = Config(**config_json)
