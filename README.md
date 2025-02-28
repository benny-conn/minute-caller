# MinuteCaller - International Calling Platform

MinuteCaller is a modern web-based platform that allows users to make affordable international phone calls directly from their browser. This project serves as an alternative to Skype's international calling service, with a focus on simplicity, transparency, and pay-as-you-go pricing.

## Features

- **Browser-Based Calling**: Make international calls directly from your web browser without any downloads
- **Pay-As-You-Go**: Purchase credits and only pay for what you use
- **Competitive Rates**: Affordable international calling rates
- **Call History**: Track your call history and expenses
- **User Management**: Create an account to manage your credits and call history
- **Mobile-Friendly**: Works on both desktop and mobile browsers

## Tech Stack

- **Frontend**: Next.js 15, React 19, Tailwind CSS
- **Authentication**: Supabase Auth
- **Database**: Supabase (PostgreSQL)
- **Payments**: Stripe
- **Calling API**: Twilio Voice API
- **State Management**: Zustand
- **Forms**: React Hook Form

## Getting Started

### Prerequisites

- Node.js 20.x or later
- npm or yarn
- Supabase account (for auth and database)
- Twilio account (for voice calls)
- Stripe account (for payments)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/minutecaller.git
cd minutecaller
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Create a `.env.local` file in the root directory with the following environment variables:

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Twilio
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

4. Start the development server:

```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Database Schema

The application uses the following database tables:

- **users**: User information (managed by Supabase Auth)
- **credits**: User credit balance
- **call_history**: Records of calls made by users
- **transactions**: Credit purchase transactions

## Deployment

This project can be deployed on Vercel or any other Next.js-compatible hosting service:

```bash
npm run build
# or
yarn build
```

## Environment Variables

For production deployment, you'll need to set the following environment variables:

- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `TWILIO_ACCOUNT_SID`: Your Twilio account SID
- `TWILIO_AUTH_TOKEN`: Your Twilio auth token
- `TWILIO_PHONE_NUMBER`: Your Twilio phone number
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: Your Stripe publishable key
- `STRIPE_SECRET_KEY`: Your Stripe secret key
- `NEXT_PUBLIC_BASE_URL`: The base URL of your deployed application

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [Next.js](https://nextjs.org/)
- [React](https://reactjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Supabase](https://supabase.io/)
- [Twilio](https://www.twilio.com/)
- [Stripe](https://stripe.com/)
