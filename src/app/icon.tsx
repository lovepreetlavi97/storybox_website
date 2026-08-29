import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = {
  width: 32,
  height: 32,
};
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #1c162e 0%, #06040d 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 8,
          border: '1.5px solid #E5B54E',
        }}
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
        >
          <path
            d="M17 6.5C15.5 5 11 4.5 9 7.5C7 10.5 11 12 13 13C15.5 14.5 16 16.5 14.5 19C12.5 21.5 8 20 8 20"
            stroke="#FF2E56"
            strokeWidth="2.8"
            strokeLinecap="round"
          />
          <path
            d="M13.5 17C14.2 18 13.5 19.5 12 20C10 20.8 8 20 8 20"
            stroke="#FFFFFF"
            strokeWidth="2.6"
            strokeLinecap="round"
          />
          <polygon points="10.5,7 13.5,8.5 10.5,10" fill="#FFFFFF" />
        </svg>
      </div>
    ),
    {
      ...size,
    }
  );
}
