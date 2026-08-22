import { ProgramEnum, UserRoleEnum } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import config from '../../config';
import prisma from '../utils/prisma';

const seedSuperAdmin = async () => {
  try {
    await prisma.$transaction(async tx => {
      // 1️⃣ Ensure Admin Department exists
      let adminDepartment = await tx.department.findFirst({
        where: {
          name: 'ADMIN',
          program: ProgramEnum.BSC,
        },
      });

      if (!adminDepartment) {
        adminDepartment = await tx.department.create({
          data: {
            name: 'ADMIN',
            program: ProgramEnum.BSC,
          },
        });
      }

      // 2️⃣ Check if Super Admin already exists
      const isSuperAdminExists = await tx.user.findFirst({
        where: {
          role: UserRoleEnum.SUPERADMIN,
        },
      });

      if (isSuperAdminExists) {
        console.log('ℹ️ Super Admin already exists.');
        return;
      }

      // 3️⃣ Hash password
      const hashedPassword = await bcrypt.hash(
        config.super_admin_password as string,
        Number(config.bcrypt_salt_rounds) || 12,
      );

      // 4️⃣ Create Super Admin
      await tx.user.create({
        data: {
          firstName: 'Super',
          lastName: 'Admin',
          email: 'admin@gmail.com',
          password: hashedPassword,

          role: UserRoleEnum.SUPERADMIN,
          isEmailVerified: true,

          universityId: 'ADMIN-0001',
          program: ProgramEnum.BSC,
          departmentId: adminDepartment.id,
        },
      });

      console.log('✅ Super Admin & Admin Department created successfully.');
    });
  } catch (error) {
    // ❌ Any error → FULL rollback (department + user)
    console.error(
      '❌ Error seeding Super Admin. Transaction rolled back.',
      error,
    );
  }
};

export default seedSuperAdmin;
