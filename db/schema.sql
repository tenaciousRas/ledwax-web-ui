CREATE TABLE storedusertokens (
    data JSON,
    CONSTRAINT validate_id CHECK ((data->>'id')::integer >= 1 AND (data->>'id') IS NOT NULL ),
    CONSTRAINT validate_name CHECK (length(data->>'name') > 0 AND (data->>'name') IS NOT NULL ),
    CONSTRAINT validate_pwd CHECK (length(data->>'pwd') > 0 AND (data->>'pwd') IS NOT NULL )
);

CREATE TABLE ParticleCloud (
    data JSON,
    CONSTRAINT generate_id SERIAL PRIMARY KEY,
    CONSTRAINT validate_id CHECK ((data->>'id')::integer >= 1 AND (data->>'id') IS NOT NULL ),
    CONSTRAINT validate_name CHECK (length(data->>'name') > 0 AND (data->>'name') IS NOT NULL ),
    CONSTRAINT validate_name CHECK (length(data->>'ip') > 0 AND (data->>'ip') IS NOT NULL )
);

CREATE TABLE LedwaxDevice (
    data JSON,
    CONSTRAINT generate_id SERIAL PRIMARY KEY,
    CONSTRAINT validate_id CHECK ((data->>'id')::integer >= 1 AND (data->>'id') IS NOT NULL ),
    CONSTRAINT validate_name CHECK (length(data->>'name') > 0 AND (data->>'name') IS NOT NULL ),
    CONSTRAINT validate_name CHECK (length(data->>'ip') > 0 AND (data->>'ip') IS NOT NULL )
);
