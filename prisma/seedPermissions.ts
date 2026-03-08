import { prisma } from "@/lib/prisma";

await prisma.permission.createMany({
  data: [
    { key: "orders.read" },
    { key: "orders.update" },
    { key: "orders.cancel" },

    { key: "menu.read" },
    { key: "menu.update" },

    { key: "users.read" },
    { key: "users.update" },

    { key: "system.manage" }
  ],
  skipDuplicates: true
})