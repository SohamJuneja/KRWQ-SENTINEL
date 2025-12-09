import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Send, Bot, User, TrendingUp, AlertCircle, CheckCircle, BarChart3, MessageSquare } from 'lucide-react';
import Dashboard from './Dashboard';
import MarketDashboard from './MarketDashboard';
import Leaderboard from './Leaderboard';
import { API_URL } from '../config';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'agent';
  timestamp: Date;
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'dashboard'>('chat');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Add welcome message on mount
  useEffect(() => {
    setMessages([{
      id: '0',
      content: `🎯 **Welcome to KRWQ Sentinel!**

I'm the world's first community-powered DeFAI hedge fund. Submit market intelligence about KRWQ or FRAX, and I'll:

✅ Verify your tip using real-time web search
✅ Analyze arbitrage opportunities
✅ Assess risk levels
✅ Calculate your commission if the tip is valuable!

**Try submitting a tip like:**
"KRWQ just announced a partnership with Samsung Pay"
"FRAX stablecoin volume increased 200% today"

Let's find alpha together! 🚀`,
      sender: 'agent',
      timestamp: new Date()
    }]);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await axios.post(`${API_URL}/api/submit-tip`, {
        tip: input,
        userId: 'demo_user'
      });

      const agentMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response.data.response,
        sender: 'agent',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, agentMessage]);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: '❌ Error processing your tip. Please try again.',
        sender: 'agent',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatAgentResponse = (content: string) => {
    // Parse JSON blocks from the response
    const jsonBlocks = content.match(/```json\n([\s\S]*?)\n```/g);
    
    if (!jsonBlocks) {
      return <div className="whitespace-pre-wrap">{content}</div>;
    }

    return (
      <div className="space-y-4">
        {jsonBlocks.map((block, index) => {
          try {
            const jsonStr = block.replace(/```json\n|\n```/g, '');
            const data = JSON.parse(jsonStr);
            
            // Render different JSON types with nice formatting
            if (data.verified !== undefined) {
              return <VerificationCard key={index} data={data} />;
            } else if (data.strategy !== undefined) {
              return <StrategyCard key={index} data={data} />;
            } else if (data.risk_level !== undefined) {
              return <RiskCard key={index} data={data} />;
            } else if (data.commission_pct !== undefined) {
              return <CommissionCard key={index} data={data} />;
            }
          } catch (e) {
            console.error('Failed to parse JSON:', e);
          }
          return null;
        })}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="bg-black/30 backdrop-blur-md border-b border-purple-500/30 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-purple-400" />
              <div>
                <h1 className="text-2xl font-bold text-white">KRWQ Sentinel</h1>
                <p className="text-sm text-purple-300">Community-Powered DeFAI Hedge Fund</p>
              </div>
            </div>
          </div>
          
          {/* Tab Navigation */}
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'chat'
                  ? 'bg-purple-600 text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              Chat
            </button>
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'dashboard'
                  ? 'bg-purple-600 text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              Dashboard
            </button>
          </div>
        </div>
      </header>

      {/* Content Area */}
      {activeTab === 'dashboard' ? (
        <div className="flex-1 overflow-y-auto p-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-4">
                <Dashboard />
                <MarketDashboard />
              </div>
              <div>
                <Leaderboard />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                msg.sender === 'user' ? 'bg-blue-500' : 'bg-purple-500'
              }`}>
                {msg.sender === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
              </div>
              
              <div className={`flex-1 ${msg.sender === 'user' ? 'text-right' : ''}`}>
                <div className={`inline-block max-w-[80%] p-4 rounded-2xl ${
                  msg.sender === 'user' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white/10 backdrop-blur-md text-white border border-purple-500/30'
                }`}>
                  {msg.sender === 'agent' ? formatAgentResponse(msg.content) : msg.content}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {msg.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center">
                <Bot className="w-5 h-5" />
              </div>
              <div className="bg-white/10 backdrop-blur-md border border-purple-500/30 p-4 rounded-2xl">
                <div className="flex gap-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

          {/* Input */}
          <div className="border-t border-purple-500/30 bg-black/30 backdrop-blur-md p-4">
            <form onSubmit={handleSubmit} className="max-w-4xl mx-auto flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Submit your market intelligence tip..."
            className="flex-1 bg-white/10 border border-purple-500/30 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white px-6 py-3 rounded-xl flex items-center gap-2 transition-colors"
          >
            <Send className="w-5 h-5" />
            Send
          </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
}

// Component cards for rendering JSON responses
function VerificationCard({ data }: { data: any }) {
  return (
    <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 p-4 rounded-lg border border-purple-500/30">
      <div className="flex items-center gap-2 mb-3">
        {data.verified ? <CheckCircle className="w-5 h-5 text-green-400" /> : <AlertCircle className="w-5 h-5 text-red-400" />}
        <span className="font-bold text-lg">Intelligence Verification</span>
      </div>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-300">Status:</span>
          <span className={`font-bold ${data.verified ? 'text-green-400' : 'text-red-400'}`}>
            {data.verified ? 'VERIFIED ✓' : 'FALSE ✗'}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-300">Confidence:</span>
          <span className="font-bold text-purple-300">{data.confidence}%</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-300">Recommendation:</span>
          <span className={`font-bold ${data.recommendation === 'TRADE' ? 'text-green-400' : 'text-red-400'}`}>
            {data.recommendation}
          </span>
        </div>
        <div className="mt-3 pt-3 border-t border-purple-500/30">
          <span className="text-gray-300">Evidence:</span>
          <p className="text-gray-200 mt-1">{data.evidence}</p>
        </div>
      </div>
    </div>
  );
}

function StrategyCard({ data }: { data: any }) {
  return (
    <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 p-4 rounded-lg border border-blue-500/30">
      <div className="flex items-center gap-2 mb-3">
        <TrendingUp className="w-5 h-5 text-blue-400" />
        <span className="font-bold text-lg">Trading Strategy</span>
      </div>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-300">Action:</span>
          <span className="font-bold text-blue-300">{data.strategy}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-300">Expected Profit:</span>
          <span className="font-bold text-green-400">{data.expected_profit_pct}%</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-300">Position Size:</span>
          <span className="font-bold text-purple-300">{data.position_size}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-300">Urgency:</span>
          <span className="font-bold text-yellow-400">{data.urgency.toUpperCase()}</span>
        </div>
        <div className="mt-3 pt-3 border-t border-blue-500/30">
          <span className="text-gray-300">Reasoning:</span>
          <p className="text-gray-200 mt-1">{data.reasoning}</p>
        </div>
      </div>
    </div>
  );
}

function RiskCard({ data }: { data: any }) {
  const riskColors: Record<string, string> = {
    LOW: 'text-green-400',
    MEDIUM: 'text-yellow-400',
    HIGH: 'text-orange-400',
    CRITICAL: 'text-red-400'
  };

  return (
    <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 p-4 rounded-lg border border-orange-500/30">
      <div className="flex items-center gap-2 mb-3">
        <AlertCircle className="w-5 h-5 text-orange-400" />
        <span className="font-bold text-lg">Risk Assessment</span>
      </div>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-300">Risk Level:</span>
          <span className={`font-bold ${riskColors[data.risk_level]}`}>{data.risk_level}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-300">Proceed:</span>
          <span className={`font-bold ${data.proceed_with_trade ? 'text-green-400' : 'text-red-400'}`}>
            {data.proceed_with_trade ? 'YES ✓' : 'NO ✗'}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-300">Position Size:</span>
          <span className="font-bold text-purple-300">{data.recommended_position_size}</span>
        </div>
        <div className="mt-3 pt-3 border-t border-orange-500/30">
          <span className="text-gray-300">Risk Factors:</span>
          <ul className="list-disc list-inside text-gray-200 mt-1">
            {data.risk_factors.map((factor: string, i: number) => (
              <li key={i}>{factor}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function CommissionCard({ data }: { data: any }) {
  return (
    <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 p-4 rounded-lg border border-purple-500/30">
      <div className="flex items-center gap-2 mb-3">
        <TrendingUp className="w-5 h-5 text-purple-400" />
        <span className="font-bold text-lg">Commission Calculation</span>
      </div>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-300">Commission Rate:</span>
          <span className="font-bold text-purple-300">{data.commission_pct}%</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-300">Estimated Payout:</span>
          <span className="font-bold text-green-400">${data.estimated_payout_usd.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-300">Tip Quality:</span>
          <span className="font-bold text-yellow-400">{data.tip_quality_score}/100</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-300">Payout Timing:</span>
          <span className="font-bold text-blue-300">{data.payout_timing}</span>
        </div>
        <div className="mt-3 pt-3 border-t border-purple-500/30">
          <span className="text-gray-300">Reasoning:</span>
          <p className="text-gray-200 mt-1">{data.commission_reasoning}</p>
        </div>
      </div>
    </div>
  );
}