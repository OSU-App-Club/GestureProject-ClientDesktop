import { useState } from 'react';
import { useRouter } from 'next/router';

const Home = () => {
  const router = useRouter();
  const [pinCode, setPinCode] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (event: any) => {
    event.preventDefault();

    if (pinCode.length !== 6) {
      setError('Pin code must be 6 characters');
      return;
    }

    router.push({
      pathname: '/clientdesktop',
      query: { pinCode },
    });
  };

  const handlePinCodeChange = (event: any) => {
    setPinCode(event.target.value);
    setError('');
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <label>
          Enter pin code:
          <input type="text" value={pinCode} onChange={handlePinCodeChange} />
        </label>
        <button type="submit">Submit</button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default Home;
