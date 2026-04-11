"""
OpenCode Web Standalone - Python Integration Example

Demonstrates how to use the static knowledge snapshot in Python applications.
"""

import json
import os
from typing import Dict, List, Any

class OpenCodePythonSDK:
    """
    Python SDK for integrating OpenCode Web Standalone knowledge base
    """
    
    def __init__(self, knowledge_path: str = "./knowledge_snapshot.json"):
        """
        Initialize the SDK with path to knowledge snapshot
        """
        self.knowledge_path = knowledge_path
        self.knowledge_base = None
        self.load_knowledge()
    
    def load_knowledge(self) -> None:
        """
        Load the static knowledge snapshot from JSON file
        """
        try:
            with open(self.knowledge_path, 'r', encoding='utf-8') as f:
                self.knowledge_base = json.load(f)
            print(f"✓ Loaded knowledge base from {self.knowledge_path}")
        except FileNotFoundError:
            raise FileNotFoundError(f"Knowledge snapshot not found at {self.knowledge_path}")
        except json.JSONDecodeError as e:
            raise ValueError(f"Invalid JSON in knowledge snapshot: {e}")
    
    def query_knowledge(self, query: str) -> Dict[str, Any]:
        """
        Query the knowledge base for relevant information
        """
        if not self.knowledge_base:
            raise ValueError("Knowledge base not loaded. Call load_knowledge() first.")
        
        query_lower = query.lower()
        results = {
            "query": query,
            "timestamp": "2026-04-10T12:38:00Z",
            "matches": []
        }
        
        # CR Rules (Market Analysis)
        if any(keyword in query_lower for keyword in ['cr规则', '市场分析', 'cr规则', 'cr规则']):
            if 'cr_rules' in self.knowledge_base:
                results["matches"].append({
                    "category": "cr_rules",
                    "data": self.knowledge_base['cr_rules']
                })
        
        # HHCI Rules (User Experience)
        if any(keyword in query_lower for keyword in ['hhci', '用户体验', '用户交互', '用户反馈']):
            if 'hhci_rules' in self.knowledge_base:
                results["matches"].append({
                    "category": "hhci_rules",
                    "data": self.knowledge_base['hhci_rules']
                })
        
        # Coding Standards
        if any(keyword in query_lower for keyword in ['编码规范', '代码规范', 'coding', 'style']):
            if 'coding_standards' in self.knowledge_base:
                results["matches"].append({
                    "category": "coding_standards",
                    "data": self.knowledge_base['coding_standards']
                })
        
        # Rational Framework
        if any(keyword in query_lower for keyword in ['理性', '框架', '分析框架', '决策框架']):
            if 'rational_framework' in self.knowledge_base:
                results["matches"].append({
                    "category": "rational_framework",
                    "data": self.knowledge_base['rational_framework']
                })
        
        return results
    
    def analyze_content(self, content: str) -> Dict[str, Any]:
        """
        Analyze content against CR rules (market analysis)
        """
        if not self.knowledge_base or 'cr_rules' not in self.knowledge_base:
            raise ValueError("CR rules not available in knowledge base")
        
        violations = []
        warnings = []
        suggestions = []
        
        for rule in self.knowledge_base['cr_rules']:
            if rule['pattern'] in content:
                if rule['severity'] == 'violation':
                    violations.append({
                        'rule': rule['name'],
                        'message': rule['description'],
                        'pattern': rule['pattern']
                    })
                elif rule['severity'] == 'warning':
                    warnings.append({
                        'rule': rule['name'],
                        'message': rule['description'],
                        'pattern': rule['pattern']
                    })
        
        return {
            "original": content,
            "analysis": {
                "violations": violations,
                "warnings": warnings,
                "suggestions": suggestions
            },
            "score": self._calculate_score(len(violations), len(warnings)),
            "timestamp": "2026-04-10T12:38:00Z"
        }
    
    def generate_system_prompt(self, include_coding_standards=True, include_cr_rules=True, include_rational_framework=True) -> str:
        """
        Generate a system prompt for LLM injection
        """
        if not self.knowledge_base:
            raise ValueError("Knowledge base not loaded")
        
        sections = [
            "# OpenCode 助手系统提示",
            "",
            "你是一个专业的 AI 编程助手，遵循以下规则和框架：",
            ""
        ]
        
        if include_coding_standards and 'coding_standards' in self.knowledge_base:
            sections.append("## 编码规范")
            for rule in self.knowledge_base['coding_standards']:
                sections.append(f"- {rule}")
            sections.append("")
        
        if include_cr_rules and 'cr_rules' in self.knowledge_base:
            sections.append("## 市场分析规则（CR 规则）")
            for rule in self.knowledge_base['cr_rules']:
                sections.append(f"- **{rule['name']}**: {rule['description']}")
            sections.append("")
        
        if include_rational_framework and 'rational_framework' in self.knowledge_base:
            sections.append("## 理性分析框架")
            for key, value in self.knowledge_base['rational_framework'].items():
                sections.append(f"### {key}")
                if isinstance(value, list):
                    for item in value:
                        sections.append(f"- {item}")
                else:
                    sections.append(value)
            sections.append("")
        
        return "\n".join(sections)
    
    def _calculate_score(self, violations: int, warnings: int) -> int:
        """
        Calculate a score based on violations and warnings
        """
        base_score = 100
        violation_penalty = 10
        warning_penalty = 3
        return max(0, base_score - (violations * violation_penalty) - (warnings * warning_penalty))

# Example usage
if __name__ == "__main__":
    # Initialize SDK
    sdk = OpenCodePythonSDK()
    
    # Query knowledge
    result = sdk.query_knowledge("什么是CR规则？")
    print("Query result:", result)
    
    # Generate system prompt
    prompt = sdk.generate_system_prompt()
    print("\nGenerated system prompt:")
    print(prompt)
    
    # Analyze content
    analysis = sdk.analyze_content("这是一个包含CR规则的测试文本")
    print("\nContent analysis:", analysis)
