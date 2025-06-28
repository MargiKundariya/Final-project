import React from "react";

const EnhancedLoader = () => {
  return (
    <div className="loading-container">
      <div className="loader">
        <div className="spinner">
          <div className="bounce1"></div>
          <div className="bounce2"></div>
          <div className="bounce3"></div>
        </div>
        <p className="loading-text">Loading Judge Details...</p>
      </div>
      
      <style jsx>{`
        .loading-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 300px;
          width: 100%;
        }
        
        .loader {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 30px;
          background-color: white;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }
        
        .spinner {
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 16px;
        }
        
        .bounce1, .bounce2, .bounce3 {
          width: 12px;
          height: 12px;
          background-color: #1890ff;
          border-radius: 50%;
          display: inline-block;
          margin: 0 4px;
          animation: sk-bouncedelay 1.4s infinite ease-in-out both;
        }
        
        .bounce1 {
          animation-delay: -0.32s;
        }
        
        .bounce2 {
          animation-delay: -0.16s;
        }
        
        .loading-text {
          margin: 0;
          color: #666;
          font-size: 16px;
          font-weight: 500;
        }
        
        @keyframes sk-bouncedelay {
          0%, 80%, 100% { 
            transform: scale(0);
          } 40% { 
            transform: scale(1.0);
          }
        }
      `}</style>
    </div>
  );
};

export default JudgeLoader;