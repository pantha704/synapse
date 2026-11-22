-- Platform operator flag: can create institutions across tenants.
ALTER TABLE "users" ADD COLUMN "is_super_admin" BOOLEAN NOT NULL DEFAULT false;
CREATE INDEX "users_is_super_admin_idx" ON "users"("is_super_admin");
