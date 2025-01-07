import { useState } from 'react';
import Navbar from './NavBar';
import PasswordList from './PasswordList';
import AddPassword from './AddPassword';

function Home() {
  const [passwords, setPasswords] = useState([
    
  ]);
  const [searchTerm, setSearchTerm] = useState('');

  const addPassword = (newPassword) => {
    setPasswords([...passwords, { id: Date.now(), ...newPassword }]);
  };

  const deletePassword = (id) => {
    setPasswords(passwords.filter(password => password.id !== id));
  };

  const filteredPasswords = passwords.filter(password =>
    password.site.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col transition-colors duration-200">
      <Navbar setSearchTerm={setSearchTerm} />
      <div className="flex-grow container mx-auto px-4 py-8">
        <AddPassword addPassword={addPassword} />
        <PasswordList passwords={filteredPasswords} deletePassword={deletePassword} />
      </div>
    </div>
  );
}

export default Home;

