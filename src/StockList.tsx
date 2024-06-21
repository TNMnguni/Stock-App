
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

// Stock interface
interface Stock {
  symbol: string;
  price: number;
  sector: string;
}
//Finnhub Generated API key
const API_KEY = 'cpqm1cpr01qo647nr3bgcpqm1cpr01qo647nr3c0';

const StockList: React.FC = () => {
  const [stocks, setStocks] = useState<Stock[]>([]);//State to hold stock
  const [portfolio, setPortfolio] = useState<Stock[]>([]);//State to hold user portfolio 
  const [loading, setLoading] = useState(true);// State to hold loading state
  const [diversity, setDiversity] = useState(0);//State to hold portfolio diversity score

  useEffect(() => {
    const fetchStocks = async () => {
      try {
        //Symbols for Dow 30 stocks
        const symbols = [
          'AAPL', 'MSFT', 'JPM', 'V', 'JNJ', 'WMT', 'PG', 'UNH', 'HD', 'DIS',
          'VZ', 'INTC', 'MRK', 'KO', 'BA', 'CSCO', 'MCD', 'XOM', 'GS', 'NKE',
          'IBM', 'AXP', 'CAT', 'MMM', 'TRV', 'CVX', 'RTX', 'WBA', 'DOW', 'AMGN'
        ];
        //Mapping stock symbols to their sectors
        const sectorMapping: { [key: string]: string } = {
          'AAPL': 'Information Technology',
          'MSFT': 'Information Technology',
          'JPM': 'Financials',
          'V': 'Information Technology',
          'JNJ': 'Health Care',
          'WMT': 'Consumer Staples',
          'PG': 'Consumer Staples',
          'UNH': 'Health Care',
          'HD': 'Consumer Discretionary',
          'DIS': 'Communication Services',
          'VZ': 'Communication Services',
          'INTC': 'Information Technology',
          'MRK': 'Health Care',
          'KO': 'Consumer Staples',
          'BA': 'Industrials',
          'CSCO': 'Information Technology',
          'MCD': 'Consumer Discretionary',
          'XOM': 'Energy',
          'GS': 'Financials',
          'NKE': 'Consumer Discretionary',
          'IBM': 'Information Technology',
          'AXP': 'Financials',
          'CAT': 'Industrials',
          'MMM': 'Industrials',
          'TRV': 'Financials',
          'CVX': 'Energy',
          'RTX': 'Industrials',
          'WBA': 'Consumer Staples',
          'DOW': 'Materials',
          'AMGN': 'Health Care'
        };
        //Fetch stock data from FinnHub API
        const requests = symbols.map(symbol =>
          axios.get(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${API_KEY}`)
        );
        const responses = await Promise.all(requests);

        //mapping the API responses to extract stock data
        const stockData: Stock[] = responses.map((response, index) => ({
          symbol: symbols[index],
          price: response.data.c,
          sector: sectorMapping[symbols[index]]
        }));

        setStocks(stockData);
      } catch (error) {
        console.error('Error fetching stock data', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStocks();
  }, []);
  //calculate portfolio diversity as the portfolio gets updated
  useEffect(() => {
    calculateDiversity();
  }, [portfolio]);

  //adding a stock to a user portfolio
  const addToPortfolio = (stock: Stock) => {
    setPortfolio(prevPortfolio => [...prevPortfolio, stock]);
  };

  //removing a stock from the user portfolio
  const removeFromPortfolio = (symbol: string) => {
    setPortfolio(prevPortfolio => prevPortfolio.filter(stock => stock.symbol !== symbol));
  };
  //Function to calculate the stock portfolio diversity

  const calculateDiversity = () => {
    const sectorWeights: { [key: string]: number } = {};
    const totalValue = portfolio.reduce((sum, stock) => sum + stock.price, 0);

    // Calculate the weight of each sector in a user portfolio
    portfolio.forEach(stock => {
      if (!sectorWeights[stock.sector]) {
        sectorWeights[stock.sector] = 0;
      }
      sectorWeights[stock.sector] += stock.price / totalValue;
    });

    // Calculate the diversity score using the formula D =(1-n=111(w2))100
    const diversityScore = 1 - Object.values(sectorWeights).reduce((sum, weight) => sum + weight ** 2, 0);
    setDiversity(Math.round(diversityScore * 100));
  };

  if (loading) {
    return <div>This should take few seconds...</div>;
  }

  return (
    <div>
      <h1>Dow 30 Stocks</h1>
      <div className="diversity-score">
        Portfolio Diversity Score: {diversity}
      </div>
      <div className="stock-container">
        <table>
          <thead>
            <tr>
              <th>Symbol</th>
              <th>Price</th>
              <th>Sector</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {stocks.map(stock => (
              <tr key={stock.symbol}>
                <td>{stock.symbol}</td>
                <td>{stock.price}</td>
                <td>{stock.sector}</td>
                <td>
                  {portfolio.some(s => s.symbol === stock.symbol) ? (
                    <button onClick={() => removeFromPortfolio(stock.symbol)}>Remove</button>
                  ) : (
                    <button onClick={() => addToPortfolio(stock)}>Add Stock</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>Your Portfolio</h2>
      <div className="portfolio-container">
        {portfolio.length === 0 ? (
          <p>No stocks in portfolio.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Symbol</th>
                <th>Price</th>
                <th>Sector</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {portfolio.map(stock => (
                <tr key={stock.symbol}>
                  <td>{stock.symbol}</td>
                  <td>{stock.price}</td>
                  <td>{stock.sector}</td>
                  <td>
                    <button onClick={() => removeFromPortfolio(stock.symbol)}>Remove</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default StockList;
