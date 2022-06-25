import { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import randomWords from 'random-words';
import { v4 } from 'uuid';
import './App.css';

const generateRandomWords = () => {
	const randomNum = (min, max) => {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	};

	return randomWords(randomNum(1, 10)).join(' ');
};

function App() {
	const [users, setUsers] = useState([]);
	const [yourInfo, setYourInfo] = useState({
		userName: '',
		message: '',
	});

	const socket = io('http://localhost:3001');
	const sendRandomMessageRef = useRef(() => {});
	const usersRef = useRef(null);

	sendRandomMessageRef.current = () => {
		socket.emit('send_message', {
			id: v4(),
			userName: 'anon',
			message: generateRandomWords(),
		});
	};

	const scrollToLastMsg = () => {
		usersRef?.current?.lastChild?.scrollIntoView({
			behavior: 'smooth',
		});
	};

	useEffect(() => {
		setInterval(() => {
			sendRandomMessageRef.current();
		}, 5000);
	}, []);

	useEffect(() => {
		socket.on(
			'receive_message',

			data => {
				setUsers(user => [...user, data]);
			},
			[socket]
		);
		scrollToLastMsg();

		return () => socket.disconnect();
	}, [socket]);

	const handleChange = e => {
		setYourInfo(yourInfo => ({
			...yourInfo,
			hasChanged: true,
			[e.target.name]: e.target.value,
		}));
	};

	const handleSubmit = e => {
		e.preventDefault();
		socket.emit('send_message', {
			id: v4(),
			userName: yourInfo.userName,
			message: yourInfo.message,
		});
	};

	return (
		<div className='app'>
			<div ref={usersRef}>
				{users.map(user => (
					<div key={user.id}>
						<span style={{ fontWeight: 'bold' }}>{user.userName}:</span>{' '}
						<span style={{ color: 'red' }}>{user.message}</span>
					</div>
				))}
			</div>
			<form onSubmit={handleSubmit}>
				<input
					type='text'
					placeholder='Username...'
					name='userName'
					value={yourInfo.userName}
					onChange={handleChange}
				/>
				<input
					type='text'
					placeholder='Message...'
					name='message'
					value={yourInfo.message}
					onChange={handleChange}
				/>
				<button onClick={handleSubmit} type='submit'>
					Send Message
				</button>
			</form>
		</div>
	);
}

export default App;
