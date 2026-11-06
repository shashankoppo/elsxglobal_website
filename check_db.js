const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
  const { data, error } = await supabase.from('hosting_services').select('*').limit(1);
  if (error) {
    console.error('Select error:', error);
  } else {
    console.log('Columns:', Object.keys(data[0] || {}));
  }
  
  if (data && data.length > 0) {
    const serviceId = data[0].id;
    const { error: updateError } = await supabase.from('hosting_services').update({
        status: 'active',
        username: 'test',
        password: '123',
        ssh_port: 22,
        web_console_url: 'http',
        ip_address: '1.1.1.1',
        control_panel_url: 'http'
    }).eq('id', serviceId);
    
    console.log('Update Error:', updateError);
  }
}

check();
