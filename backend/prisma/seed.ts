import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const libraryEntries = [
  {
    name: "Jiboia",
    characteristics: "Planta trepadeira resistente, ideal para ambientes internos com luz indireta.",
    generalInstructions:
      "Regar quando o solo secar superficialmente. Evitar encharcamento e manter em temperatura amena."
  },
  {
    name: "Espada-de-sao-jorge",
    characteristics: "Folhas longas e rigidas, tolerante a baixa luminosidade e pouca agua.",
    generalInstructions:
      "Regar de forma espaçada, deixando o substrato secar entre regas. Boa para iniciantes."
  },
  {
    name: "Costela-de-adao",
    characteristics: "Folhas recortadas, crescimento vigoroso em ambientes umidos e luminosos.",
    generalInstructions:
      "Preferir luz indireta forte, regas moderadas e adubacao mensal no periodo de crescimento."
  }
];

async function main() {
  await Promise.all(
    libraryEntries.map((entry) =>
      prisma.plantLibraryEntry.upsert({
        where: { name: entry.name },
        update: entry,
        create: entry
      })
    )
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
