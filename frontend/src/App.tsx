import { getTelegramUser } from './telegram';

function App() {
  const user = getTelegramUser();

  return (
    <div>
      <h1>Idle Clicker</h1>
      {user && <p>Привет, {user.first_name}!</p>}
    </div>
  );
}

export default App;
