import { useEffect, useRef, useState } from 'react';

import './video.css';

interface Props {
	email: string;
	stream: MediaStream;
	muted?: boolean;
}

const Video = ({ email, stream, muted }: Props) => {
	const ref = useRef<HTMLVideoElement>(null);
	const [isMuted, setIsMuted] = useState<boolean>(false);

	useEffect(() => {
		if (ref.current) ref.current.srcObject = stream;
		if (muted) setIsMuted(muted);
	}, [stream, muted]);

	return (
		<div className='container'>
			<video className='videoContainer' ref={ref} muted={isMuted} autoPlay />
			<p className='userLabel'>{email}</p>
		</div>
	);
};

export default Video;
