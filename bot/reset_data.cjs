const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: SUPABASE_URL and SUPABASE_SECRET_KEY must be set in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log('=== Resetting Indonesia Profile ===');
  const { data: idProfile, error: idError } = await supabase
    .from('profiles')
    .update({
      available_balance: 0,
      income: 0,
      expenses: 0,
      remaining: 0,
      safe_spending: 0,
      total_balance: 0,
    })
    .eq('workspace', 'indonesia')
    .select();

  if (idError) {
    console.error('Error updating Indonesia profile:', idError);
  } else {
    console.log('Indonesia profile updated:', idProfile);
  }

  console.log('\n=== Resetting Sri Lanka Profile ===');
  const { data: lkProfile, error: lkError } = await supabase
    .from('profiles')
    .update({
      available_balance: 0,
      income: 0,
      expenses: 0,
      remaining: 0,
      safe_spending: 0,
      total_balance: 0,
    })
    .eq('workspace', 'sri-lanka')
    .select();

  if (lkError) {
    console.log('Sri Lanka profile not found or error:', lkError.message || lkError);
  } else {
    console.log('Sri Lanka profile updated:', lkProfile);
  }

  console.log('\n=== Deleting Indonesia Transactions ===');
  const { error: idTxError } = await supabase
    .from('transactions')
    .delete()
    .eq('workspace', 'indonesia');

  if (idTxError) {
    console.error('Error deleting Indonesia transactions:', idTxError);
  } else {
    console.log('Indonesia transactions deleted');
  }

  console.log('\n=== Deleting Sri Lanka Transactions ===');
  const { error: lkTxError } = await supabase
    .from('transactions')
    .delete()
    .eq('workspace', 'sri-lanka');

  if (lkTxError) {
    console.error('Error deleting Sri Lanka transactions:', lkTxError);
  } else {
    console.log('Sri Lanka transactions deleted');
  }

  console.log('\n=== Verification ===');
  const { data: profiles } = await supabase
    .from('profiles')
    .select('*')
    .in('workspace', ['indonesia', 'sri-lanka']);
  console.log('Profiles after update:', JSON.stringify(profiles, null, 2));

  const { data: transactions } = await supabase
    .from('transactions')
    .select('*')
    .in('workspace', ['indonesia', 'sri-lanka']);
  console.log('Transactions after delete:', transactions?.length || 0);
}

main().catch(console.error);
