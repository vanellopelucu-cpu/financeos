const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: SUPABASE_URL and SUPABASE_SECRET_KEY must be set in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log('=== Checking profiles ===');
  const { data: profiles, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .in('workspace', ['indonesia', 'sri-lanka']);

  if (profileError) {
    console.error('Error fetching profiles:', profileError);
  } else {
    console.log('Profiles found:', profiles?.length || 0);
    console.log(JSON.stringify(profiles, null, 2));
  }

  console.log('\n=== Checking transactions ===');
  const { data: transactions, error: txError } = await supabase
    .from('transactions')
    .select('*')
    .in('workspace', ['indonesia', 'sri-lanka']);

  if (txError) {
    console.error('Error fetching transactions:', txError);
  } else {
    console.log('Transactions found:', transactions?.length || 0);
    if (transactions && transactions.length > 0) {
      console.log('First transaction:', JSON.stringify(transactions[0], null, 2));
    }
  }
}

main().catch(console.error);
