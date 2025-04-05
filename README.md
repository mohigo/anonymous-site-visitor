# Anonymous Site Visitor Analytics

A sophisticated web analytics platform that provides detailed visitor insights while maintaining user privacy. Built with Next.js, MongoDB, and machine learning capabilities.

## Features

### 🔍 Advanced Visitor Identification
- Privacy-focused fingerprinting without using cookies
- Unique visitor tracking across sessions
- Accurate visit count with anti-duplicate protection
- Browser and country detection

### 📊 Real-time Analytics
- Total visitors and unique visitor counts
- Active visitors tracking
- Visit duration analysis
- Hourly visitor distribution
- Geographic distribution
- Browser usage statistics

### 🤖 Machine Learning Insights
- Behavior pattern recognition
- Anomaly detection
- Return visitor analysis
- Peak hour identification

### 🎨 Modern UI/UX
- Clean, responsive dashboard
- Interactive charts and graphs
- Real-time data updates
- Dark/light theme support

## Technology Stack

- **Frontend**: Next.js 14, React, TailwindCSS
- **Backend**: Next.js API Routes, MongoDB
- **Analytics**: Custom ML algorithms
- **Data Visualization**: Recharts
- **Styling**: Tailwind CSS, Heroicons

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/anonymous-site-visitor.git
   cd anonymous-site-visitor
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env.local` file with:
   ```
   MONGODB_URI=your_mongodb_connection_string
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) to view the application

## Architecture

### Visitor Tracking
- Client-side fingerprinting using browser characteristics
- Server-side visitor identification and validation
- 30-minute session management
- Accurate visit counting with duplicate prevention

### Data Storage
- MongoDB for visitor records
- Efficient indexing for quick analytics
- Structured data model for visitor profiles

### Analytics Engine
- Real-time data processing
- Machine learning pattern detection
- Anomaly identification
- Statistical analysis

## API Endpoints

### `/api/visitor`
- `POST`: Record new visitor or update existing visitor
- `GET`: Retrieve specific visitor profile and analytics

### `/api/visitors`
- `GET`: Fetch aggregated analytics and recent visitors
- Includes total counts, patterns, and distributions

## Security & Privacy

- No personal data collection
- No cookies required
- Anonymous visitor identification
- Data aggregation for analytics
- Configurable data retention

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Next.js team for the amazing framework
- MongoDB for reliable data storage
- TailwindCSS for beautiful styling
- Open source community for various tools and libraries

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
