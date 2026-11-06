async function test() {
  const res = await fetch('http://localhost:3001/api/admin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer DEV_BYPASS_TOKEN' },
    body: JSON.stringify({ action: 'list-services' })
  });
  const json = await res.json();
  const service = json.data[0];
  console.log('Got service ID:', service.id);

  const res2 = await fetch('http://localhost:3001/api/admin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer DEV_BYPASS_TOKEN' },
    body: JSON.stringify({
      action: 'update-service',
      serviceId: service.id,
      status: 'active',
      ssh_port: 2222
    })
  });
  const json2 = await res2.json();
  console.log('Update response:', res2.status, json2);
}
test();
