import next from "eslint-config-next";

const eslintConfig = [
  ...next,
  {
    ignores: ["playwright-report/**", "test-results/**", ".next/**", "prisma/migrations/**"],
  },
];

export default eslintConfig;
