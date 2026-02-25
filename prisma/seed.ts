import { prisma } from "../src/lib/prisma";
import bcrypt from "bcryptjs";

async function main() {
  // Tenants
  const tenantA = await prisma.tenant.upsert({
    where: { slug: "a" },
    update: { name: "Tenant A" },
    create: { slug: "a", name: "Tenant A" },
  });

  await prisma.tenant.upsert({
    where: { slug: "b" },
    update: { name: "Tenant B" },
    create: { slug: "b", name: "Tenant B" },
  });

  // Permissions
  const perms = ["ops.read", "ops.assign", "users.manage", "tenants.manage"];
  for (const key of perms) {
    await prisma.permission.upsert({
      where: { key },
      update: {},
      create: { key, desc: key },
    });
  }

  // Roles (Tenant A)
  const adminRole = await prisma.role.upsert({
    where: { tenantId_key: { tenantId: tenantA.id, key: "ADMIN" } },
    update: { name: "Admin" },
    create: { tenantId: tenantA.id, key: "ADMIN", name: "Admin" },
  });

  // ADMIN role -> all permissions (Tenant A)
  const allPerms = await prisma.permission.findMany({
    where: { key: { in: perms } },
  });

  for (const p of allPerms) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: adminRole.id, permissionId: p.id } },
      update: {},
      create: { roleId: adminRole.id, permissionId: p.id },
    });
  }

  // User (fixed credentials)
  const email = "test@a.com";
  const passwordPlain = "123456";
  const passwordHash = await bcrypt.hash(passwordPlain, 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: { password: passwordHash, name: "Test Admin" },
    create: { email, password: passwordHash, name: "Test Admin" },
  });

  // Membership (Tenant A)
  const membership = await prisma.membership.upsert({
    where: { tenantId_userId: { tenantId: tenantA.id, userId: user.id } },
    update: { status: "ACTIVE" },
    create: { tenantId: tenantA.id, userId: user.id, status: "ACTIVE" },
  });

  // Role binding
  await prisma.roleBinding.upsert({
    where: { membershipId_roleId: { membershipId: membership.id, roleId: adminRole.id } },
    update: {},
    create: { membershipId: membership.id, roleId: adminRole.id },
  });

  console.log("✅ Seed OK:", { email, passwordPlain, tenant: tenantA.slug });
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });