"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeedInitialData1761770940616 = void 0;
const bcrypt = __importStar(require("bcrypt"));
class SeedInitialData1761770940616 {
    async up(queryRunner) {
        const adminExists = await queryRunner.query(`SELECT id FROM users WHERE email = 'admin@fastx.com' LIMIT 1`);
        if (adminExists.length === 0) {
            const adminPassword = await bcrypt.hash('Admin@123456', 10);
            await queryRunner.query(`
        INSERT INTO users (
          id,
          name,
          email,
          phone,
          role,
          password,
          is_active,
          is_verified,
          created_at,
          updated_at
        ) VALUES (
          gen_random_uuid(),
          'System Admin',
          'admin@fastx.com',
          '01700000000',
          'admin',
          '${adminPassword}',
          true,
          true,
          NOW(),
          NOW()
        )
      `);
            console.log('✅ Admin user created: admin@fastx.com / Admin@123456');
        }
        if (process.env.NODE_ENV === 'development') {
            const merchantExists = await queryRunner.query(`SELECT id FROM users WHERE email = 'merchant@fastx.com' LIMIT 1`);
            if (merchantExists.length === 0) {
                const merchantPassword = await bcrypt.hash('Merchant@123', 10);
                await queryRunner.query(`
          INSERT INTO users (
            id,
            name,
            email,
            phone,
            role,
            password,
            is_active,
            is_verified,
            wallet_balance,
            created_at,
            updated_at
          ) VALUES (
            gen_random_uuid(),
            'Test Merchant',
            'merchant@fastx.com',
            '01711111111',
            'merchant',
            '${merchantPassword}',
            true,
            true,
            5000.00,
            NOW(),
            NOW()
          )
        `);
                console.log('✅ Test merchant created: merchant@fastx.com / Merchant@123');
            }
            const riderExists = await queryRunner.query(`SELECT id FROM users WHERE email = 'rider@fastx.com' LIMIT 1`);
            if (riderExists.length === 0) {
                const riderPassword = await bcrypt.hash('Rider@123', 10);
                await queryRunner.query(`
          INSERT INTO users (
            id,
            name,
            email,
            phone,
            role,
            password,
            is_active,
            is_verified,
            wallet_balance,
            created_at,
            updated_at
          ) VALUES (
            gen_random_uuid(),
            'Test Rider',
            'rider@fastx.com',
            '01722222222',
            'rider',
            '${riderPassword}',
            true,
            true,
            0.00,
            NOW(),
            NOW()
          )
        `);
                console.log('✅ Test rider created: rider@fastx.com / Rider@123');
            }
            const hubStaffExists = await queryRunner.query(`SELECT id FROM users WHERE email = 'hub@fastx.com' LIMIT 1`);
            if (hubStaffExists.length === 0) {
                const hubPassword = await bcrypt.hash('Hub@123', 10);
                await queryRunner.query(`
          INSERT INTO users (
            id,
            name,
            email,
            phone,
            role,
            password,
            is_active,
            is_verified,
            created_at,
            updated_at
          ) VALUES (
            gen_random_uuid(),
            'Test Hub Staff',
            'hub@fastx.com',
            '01733333333',
            'hub_staff',
            '${hubPassword}',
            true,
            true,
            NOW(),
            NOW()
          )
        `);
                console.log('✅ Test hub staff created: hub@fastx.com / Hub@123');
            }
        }
    }
    async down(queryRunner) {
        await queryRunner.query(`
      DELETE FROM users WHERE email IN (
        'admin@fastx.com',
        'merchant@fastx.com',
        'rider@fastx.com',
        'hub@fastx.com'
      )
    `);
        console.log('✅ Seeded users removed');
    }
}
exports.SeedInitialData1761770940616 = SeedInitialData1761770940616;
//# sourceMappingURL=1761770940616-SeedInitialData.js.map