const fs = require('fs');
const path = require('path');

const envConfigFile = `export const environment = {
  production: true,
  apiUrl: '${process.env['API_URL'] || 'https://api.prodmanager.com.ar'}',
  supabaseUrl: '${process.env['SUPABASE_URL'] || 'https://jrcdlzqbadyueodqpsii.supabase.co'}',
  supabaseAnonKey: '${process.env['SUPABASE_ANON_KEY'] || 'sb_publishable_Fb1XxcUkSIdPKf1MdWw_BQ_By-uPGdB'}'
};
`;

const dir = './src/environments';
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

const targetPath = path.join(__dirname, './src/environments/environment.ts');

console.log(`Generating environment file at ${targetPath}`);

fs.writeFile(targetPath, envConfigFile, function (err) {
  if (err) {
    console.error(err);
    throw err;
  } else {
    console.log(`Environment file generated successfully.`);
  }
});
