/**
 * Database Configuration
 * 
 * This project has migrated to Supabase (PostgreSQL).
 * Mongoose and MongoDB are no longer used.
 */

const supabase = require('./supabase');

const connectDB = async () => {
  console.log('🚀 Supabase connection initialized via @supabase/supabase-js');
  // No explicit connection needed for Supabase client, but we keep this 
  // for architectural consistency with the previous MongoDB setup.
  return true;
};

module.exports = {
  connectDB,
  supabase,
  // Placeholder for any raw SQL queries that might still be using this export
  query: async (text, params) => {
    console.error('. Legacy query() called. Please refactor to use supabase client or rpc.');
    console.error('Query:', text);
    throw new Error('Direct SQL queries via config/db are deprecated. Use supabase client.');
  }
};
