import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('transactions', (table) => {
    table.string('id', 36).primary();
    table.string('wallet_id', 36).notNullable();
    table.enum('type', ['credit', 'debit']).notNullable();
    table.decimal('amount', 20, 2).notNullable();
    table.string('reference', 100).notNullable().unique();
    table.enum('status', ['pending', 'success', 'failed'])
      .notNullable()
      .defaultTo('pending');
    table.string('description', 255).nullable();
    table.json('metadata').nullable();
    table.timestamps(true, true);

    table
      .foreign('wallet_id')
      .references('id')
      .inTable('wallets')
      .onDelete('CASCADE');

    table.index(['wallet_id']);
    table.index(['reference']);
    table.index(['status']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('transactions');
}