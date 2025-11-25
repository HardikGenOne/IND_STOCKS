import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

// --- STYLED COMPONENTS ---
const Container = styled.div`
  min-height: 100vh;
  background-color: #0e1016;
  color: white;
  font-family: 'Inter', sans-serif;
  overflow-x: hidden;
`;

const Navbar = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 40px;
  max-width: 1200px;
  margin: 0 auto;
`;

const Logo = styled.h1`
  font-size: 24px;
  font-weight: 800;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  cursor: pointer;
`;

const NavLinks = styled.div`
  display: flex;
  gap: 20px;
`;

const Button = styled(Link)`
  padding: 10px 24px;
  border-radius: 8px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.2s;
  
  &.primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
    &:hover { transform: translateY(-2px); }
  }

  &.secondary {
    background: transparent;
    color: #ccc;
    border: 1px solid #333;
    &:hover { color: white; border-color: white; }
  }
`;

const HeroSection = styled.section`
  text-align: center;
  padding: 100px 20px;
  max-width: 800px;
  margin: 0 auto;
`;

const Headline = styled.h1`
  font-size: 56px;
  font-weight: 800;
  line-height: 1.2;
  margin-bottom: 20px;
  
  span {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
`;

const Subheadline = styled.p`
  font-size: 18px;
  color: #8892b0;
  margin-bottom: 40px;
  line-height: 1.6;
`;

const FeatureGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
  max-width: 1200px;
  margin: 0 auto 100px;
  padding: 0 20px;
`;

const FeatureCard = styled.div`
  background: #1E222D;
  padding: 30px;
  border-radius: 16px;
  border: 1px solid #2B2B43;
  text-align: left;
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-5px);
    border-color: #667eea;
  }

  h3 { font-size: 20px; margin-bottom: 10px; color: white; }
  p { color: #8892b0; font-size: 15px; line-height: 1.5; }
`;

const Home = ({ user }) => {
  return (
    <Container>
      {/* NAVBAR */}
      <Navbar>
        <Logo>Signalist Pro</Logo>
        <NavLinks>
          {user ? (
            <Button to="/dashboard" className="primary">Go to Dashboard</Button>
          ) : (
            <>
              <Button to="/login" className="secondary">Log In</Button>
              <Button to="/login" className="primary">Sign Up</Button>
            </>
          )}
        </NavLinks>
      </Navbar>

      {/* HERO SECTION */}
      <HeroSection>
        <Headline>
          Master Crypto Trading <br />
          <span>Without The Risk.</span>
        </Headline>
        <Subheadline>
          Practice trading BTC, ETH, and SOL with live market data and $10,000 in virtual capital. 
          Draw trendlines, analyze charts, and track your PnL in real-time.
        </Subheadline>
        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
          <Button to={user ? "/dashboard" : "/login"} className="primary" style={{ fontSize: '18px', padding: '15px 40px' }}>
            Start Trading Now
          </Button>
        </div>
      </HeroSection>

      {/* FEATURES */}
      <FeatureGrid>
        <FeatureCard>
          <h3>📈 Real-Time Data</h3>
          <p>Connect directly to Binance WebSockets for millisecond-latency price updates. No lag, just live markets.</p>
        </FeatureCard>
        <FeatureCard>
          <h3>💰 $10,000 Virtual Cash</h3>
          <p>Start with a paper trading wallet. Blow it up? No problem. It's the safest way to learn price action.</p>
        </FeatureCard>
        <FeatureCard>
          <h3>🛠 Professional Tools</h3>
          <p>Use advanced charting tools, draw trendlines, and analyze candlesticks just like the pros.</p>
        </FeatureCard>
      </FeatureGrid>

    </Container>
  );
};

export default Home;