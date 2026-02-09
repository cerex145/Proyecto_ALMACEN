-- Reemplazar temperatura_c por temperatura_min_c y temperatura_max_c en productos
ALTER TABLE `productos`
  DROP COLUMN `temperatura_c`,
  ADD COLUMN `temperatura_min_c` DECIMAL(6,2) NULL AFTER `um`,
  ADD COLUMN `temperatura_max_c` DECIMAL(6,2) NULL AFTER `temperatura_min_c`;
