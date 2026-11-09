import { seedAllInitialDataToFirestore } from "../firebaseServices";

export const seedFirestore = async (force: boolean = false) => {
  return await seedAllInitialDataToFirestore(force);
};

export default seedFirestore;
