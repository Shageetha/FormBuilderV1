from uuid import UUID as BaseUUID

class UUID(BaseUUID):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not isinstance(v, BaseUUID):
            raise TypeError('UUID must be a valid UUID')
        return str(v)

    @classmethod
    def __modify_schema__(cls, field_schema):
        field_schema.update(type='string', format='uuid') 