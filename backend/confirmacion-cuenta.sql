USE power_code;

ALTER TABLE usuarios
ADD COLUMN token_confirmacion VARCHAR(100) NULL;

ALTER TABLE usuarios
ADD INDEX idx_token_confirmacion (token_confirmacion);
