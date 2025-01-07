function PasswordList({ passwords, deletePassword }) {
    return (
      <div className="mt-8 w-full max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Your Passwords</h2>
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden transition-colors duration-200">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Site</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Username</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Password</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {passwords.map((password) => (
                <tr key={password.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white">{password.site}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white">{password.username}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white">••••••••</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => deletePassword(password.id)}
                      className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
  
  export default PasswordList;
  
  