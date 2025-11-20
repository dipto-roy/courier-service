"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnableUuidExtension1761771966395 = void 0;
class EnableUuidExtension1761771966395 {
    async up(queryRunner) {
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
        console.log('✅ UUID extension (uuid-ossp) enabled successfully');
        console.log('   Available functions: gen_random_uuid(), uuid_generate_v4(), etc.');
    }
    async down(queryRunner) {
        await queryRunner.query(`DROP EXTENSION IF EXISTS "uuid-ossp" CASCADE`);
        console.log('⚠️  UUID extension (uuid-ossp) has been removed');
        console.log('   Warning: This may break tables with UUID columns');
    }
}
exports.EnableUuidExtension1761771966395 = EnableUuidExtension1761771966395;
//# sourceMappingURL=1761771966395-EnableUuidExtension.js.map