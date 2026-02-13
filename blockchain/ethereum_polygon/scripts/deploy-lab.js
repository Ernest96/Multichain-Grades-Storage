import hre from "hardhat";

async function main() {
  const LabGradeStorage = await hre.ethers.getContractFactory("LabGradeStorage");
  const labGradeStorage = await LabGradeStorage.deploy();
  await labGradeStorage.waitForDeployment();

  console.log("Deployed to:", await labGradeStorage.getAddress());
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});