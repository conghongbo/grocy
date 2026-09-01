-- Add rechargeable battery support
-- Existing batteries are treated as rechargeable for backwards compatibility
ALTER TABLE batteries
ADD COLUMN rechargeable INTEGER NOT NULL DEFAULT 1 CHECK (rechargeable IN (0, 1));

-- Indicates whether a rechargeable battery is currently charged and ready
ALTER TABLE batteries
ADD COLUMN is_charged INTEGER NOT NULL DEFAULT 1 CHECK (is_charged IN (0, 1));