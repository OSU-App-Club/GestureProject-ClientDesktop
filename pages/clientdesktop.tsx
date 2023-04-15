import { useEffect, useRef, useState } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import { Inter } from 'next/font/google';
import styles from '@/styles/clientdesktop.module.css';
import { useRouter } from 'next/router';

const inter = Inter({ subsets: ['latin'] });

export default function Home() {
  const router = useRouter();

  const socketRef = useRef<WebSocket>();
  const [isDisconnected, setIsDisconnected] = useState(false);
  const [lastMessageReceivedAt, setLastMessageReceivedAt] = useState<number | null>(null);
  const [elapsedTimeInSeconds, setElapsedTimeInSeconds] = useState<number>(0);

  useEffect(() => {
    const { pinCode } = router.query;
    // only initialize if socketRef.current is undefined and pinCode is defined
    if (pinCode && !socketRef.current) {
      initialize(pinCode as string);
    }
    const intervalId = setInterval(() => {
      if (lastMessageReceivedAt) {
        setElapsedTimeInSeconds(Math.floor((Date.now() - lastMessageReceivedAt) / 1000));
      }
    }, 100);  // every 100ms, update the elapsed time
    return () => clearInterval(intervalId);
  }, [router, lastMessageReceivedAt]);

  function initialize(pinCode: string) {
    // your initialization code goes here
    console.log('Component initialized');

    console.log(`pinCode: ${pinCode}`);

    const socket = new WebSocket(`ws://localhost:5000/rabbitmq?pinCode=${pinCode}`);

    socketRef.current = socket;

    socket.addEventListener('open', (event) => {
      console.log('WebSocket connection established');
      // Do something when the connection is established
      setIsDisconnected(false);
    });

    socket.addEventListener('message', (event) => {
      console.log(`Received message: ${event.data}`);
      // Do something with the received message
      setLastMessageReceivedAt(Date.now());
    });

    socket.addEventListener('close', (event) => {
      console.log('WebSocket connection closed');
      // Do something when the connection is closed
      setIsDisconnected(true);
    });
  }

  const handleDisconnect = () => {
    // Close the WebSocket connection
    if (socketRef.current) {
      socketRef.current.close();
    }
    router.push('/');
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  const getFormattedTimeAgo = () => {
    if (!lastMessageReceivedAt) {
      return 'No messages received yet';
    }

    if (elapsedTimeInSeconds < 60) {
      return `${elapsedTimeInSeconds} second${elapsedTimeInSeconds > 1 ? 's' : ''} ago`;
    }

    const elapsedTimeInMinutes = Math.floor(elapsedTimeInSeconds / 60);

    if (elapsedTimeInMinutes < 60) {
      return `${elapsedTimeInMinutes} minute${elapsedTimeInMinutes > 1 ? 's' : ''} ago`;
    }

    const elapsedTimeInHours = Math.floor(elapsedTimeInMinutes / 60);

    if (elapsedTimeInHours < 24) {
      return `${elapsedTimeInHours} hour${elapsedTimeInHours > 1 ? 's' : ''} ago`;
    }

    // Format date and time using built-in options
    const date = new Date(lastMessageReceivedAt);
    return date.toLocaleString();
  };

  return (
    <div>
      {isDisconnected && (
        <div className={styles.connectionLost}>
          <p>Connection disconnected</p>
          <button onClick={handleRefresh}>Refresh page</button>
        </div>
      )}
      <p>Connected</p>
      <p>Last message received: {getFormattedTimeAgo()}</p>
      <button onClick={handleDisconnect}>Disconnect</button>
    </div>
  );
}
