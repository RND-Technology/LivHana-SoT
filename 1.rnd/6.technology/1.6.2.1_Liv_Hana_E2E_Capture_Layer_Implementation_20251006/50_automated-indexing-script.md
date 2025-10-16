### Automated Indexing Script

```python
#!/usr/bin/env python3
# search-index-generator.py
# Creates searchable indexes of all captured context

import os
import json
import re
from datetime import datetime
from pathlib import Path
import hashlib
from typing import Dict, List, Any

class LivHanaSearchIndexer:
    def __init__(self, base_path: str = "liv-hana-e2e-pipeline"):
        self.base_path = Path(base_path)
        self.context_path = self.base_path / "context_dragnet" 
        self.index_path = self.base_path / "search-index"
        self.setup_directories()
        
    def setup_directories(self):
        """Create necessary directory structure for indexes"""
        directories = [
            self.index_path / "embeddings",
            self.index_path / "full-text", 
            self.index_path / "metadata",
            self.index_path / "relationships"
        ]
        for directory in directories:
            directory.mkdir(parents=True, exist_ok=True)
            
    def extract_conversations(self) -> List[Dict[str, Any]]:
        """Extract and structure all conversation data"""
        conversations = []
        
        # Process Claude conversations
        claude_path = self.context_path / "transcripts" / "claude"
        for file_path in claude_path.glob("**/*.json"):
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    conversations.append({
                        "platform": "claude",
                        "file": str(file_path),
                        "content": data,
                        "extracted": datetime.now().isoformat()
                    })
            except Exception as e:
                print(f"Error processing {file_path}: {e}")
                
        # Process other platforms (markdown files)
        for platform in ["chatgpt", "gemini", "perplexity"]:
            platform_path = self.context_path / "transcripts" / platform
            for file_path in platform_path.glob("**/*.md"):
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        content = f.read()
                        conversations.append({
                            "platform": platform,
                            "file": str(file_path),
                            "content": content,
                            "extracted": datetime.now().isoformat()
                        })
                except Exception as e:
                    print(f"Error processing {file_path}: {e}")
                    
        return conversations
    
    def build_full_text_index(self, conversations: List[Dict[str, Any]]):
        """Build full-text search index"""
        full_text_index = {
            "created": datetime.now().isoformat(),
            "total_conversations": len(conversations),
            "platforms": {},
            "keywords": {},
            "topics": {}
        }
        
        # Extract keywords and topics
        cannabis_terms = [
            "hemp", "cannabis", "thc", "cbd", "dshs", "reggie", "dro", 
            "blue dream", "cheetah piss", "compliance", "coa", "21+",
            "age verification", "texas", "wyoming", "dispensary"
        ]
        
        business_terms = [
            "revenue", "ebitda", "square", "payment", "customer", "retention",
            "raffle", "membership", "subscription", "roi", "conversion"
        ]
        
        technical_terms = [
            "api", "integration", "replit", "deployment", "webhook", "database",
            "authentication", "ssl", "cdn", "performance", "monitoring"
        ]
        
        all_keywords = cannabis_terms + business_terms + technical_terms
        
        for conversation in conversations:
            platform = conversation["platform"]
            content = str(conversation["content"]).lower()
            
            # Initialize platform stats
            if platform not in full_text_index["platforms"]:
                full_text_index["platforms"][platform] = {
                    "count": 0,
                    "keywords": {}
                }
            
            full_text_index["platforms"][platform]["count"] += 1
            
            # Count keyword occurrences
            for keyword in all_keywords:
                count = len(re.findall(r'\b' + re.escape(keyword.lower()) + r'\b', content))
                if count > 0:
                    # Global keyword stats
                    if keyword not in full_text_index["keywords"]:
                        full_text_index["keywords"][keyword] = {"total": 0, "platforms": {}}
                    full_text_index["keywords"][keyword]["total"] += count
                    
                    if platform not in full_text_index["keywords"][keyword]["platforms"]:
                        full_text_index["keywords"][keyword]["platforms"][platform] = 0
                    full_text_index["keywords"][keyword]["platforms"][platform] += count
                    
                    # Platform-specific keyword stats  
                    if keyword not in full_text_index["platforms"][platform]["keywords"]:
                        full_text_index["platforms"][platform]["keywords"][keyword] = 0
                    full_text_index["platforms"][platform]["keywords"][keyword] += count
        
        # Save full-text index
        with open(self.index_path / "full-text" / "index.json", 'w') as f:
            json.dump(full_text_index, f, indent=2)
            
        print(f"✅ Full-text index created: {len(conversations)} conversations indexed")
        
    def build_metadata_index(self, conversations: List[Dict[str, Any]]):
        """Build metadata index for quick lookups"""
        metadata_index = {
            "created": datetime.now().isoformat(),
            "conversations": [],
            "summary": {
                "total_conversations": len(conversations),
                "platforms": {},
                "date_range": {"earliest": None, "latest": None}
            }
        }
        
        dates = []
        
        for i, conversation in enumerate(conversations):
            # Create conversation metadata
            conv_metadata = {
                "id": hashlib.md5(str(conversation["file"]).encode()).hexdigest()[:8],
                "platform": conversation["platform"],
                "file_path": conversation["file"],
                "extracted": conversation["extracted"],
                "word_count": len(str(conversation["content"]).split()),
                "char_count": len(str(conversation["content"])),
                "topics": self.extract_topics(str(conversation["content"]))
            }
            
            metadata_index["conversations"].append(conv_metadata)
            
            # Update platform summary
            platform = conversation["platform"]
            if platform not in metadata_index["summary"]["platforms"]:
                metadata_index["summary"]["platforms"][platform] = 0
            metadata_index["summary"]["platforms"][platform] += 1
            
            # Track dates
            dates.append(conversation["extracted"])
            
        # Set date range
        if dates:
            metadata_index["summary"]["date_range"]["earliest"] = min(dates)
            metadata_index["summary"]["date_range"]["latest"] = max(dates)
            
        # Save metadata index
        with open(self.index_path / "metadata" / "index.json", 'w') as f:
            json.dump(metadata_index, f, indent=2)
            
        print(f"✅ Metadata index created: {len(conversations)} conversation records")
        
    def extract_topics(self, content: str) -> List[str]:
        """Extract key topics from conversation content"""
        topics = []
        
        topic_patterns = {
            "veriff_crisis": r"veriff|age verification|customer.*block",
            "legislative_strategy": r"sb3|hb28|testimony|april.*7.*2025|texas.*legislature", 
            "family_estate": r"bylt|bear yuba|ranch|perry|laurel|jason|trust",
            "business_strategy": r"revenue|ebitda|growth|expansion|roi",
            "technical_architecture": r"api|deployment|replit|square.*integration",
            "content_creation": r"high noon|cartoon|hnc|episode|satirical",
            "compliance": r"hemp.*compliance|dshs|21\+|coa|testing",
            "agent_development": r"liv hana|agent.*swarm|character.*development"
        }
        
        content_lower = content.lower()
        for topic, pattern in topic_patterns.items():
            if re.search(pattern, content_lower):
                topics.append(topic)
                
        return topics
        
    def build_relationship_index(self, conversations: List[Dict[str, Any]]):
        """Build relationship index between entities and concepts"""
        relationships = {
            "created": datetime.now().isoformat(),
            "entities": {},
            "connections": []
        }
        
        # Define key entities
        entities = {
            "people": ["jesse", "liv hana", "perry", "laurel", "jason", "heather", "andrea steel", "charlie", "andrew", "beth"],
            "businesses": ["reggie & dro", "high noon cartoon", "one plant solution", "herbitrage", "acenote ai"],
            "platforms": ["claude", "chatgpt", "gemini", "perplexity", "replit", "square", "notion"],
            "locations": ["texas", "wyoming", "stone oak", "alice", "ranch", "bear yuba"],
            "concepts": ["hemp compliance", "age verification", "legislative testimony", "revenue optimization"]
        }
        
        # Extract entity relationships
        for conversation in conversations:
            content = str(conversation["content"]).lower()
            
            for category, entity_list in entities.items():
                for entity in entity_list:
                    if entity.lower() in content:
                        if entity not in relationships["entities"]:
                            relationships["entities"][entity] = {
                                "category": category,
                                "mentions": 0,
                                "platforms": set(),
                                "related_entities": set()
                            }
                        
                        relationships["entities"][entity]["mentions"] += 1
                        relationships["entities"][entity]["platforms"].add(conversation["platform"])
                        
                        # Find related entities in same conversation
                        for other_category, other_entity_list in entities.items():
                            for other_entity in other_entity_list:
                                if other_entity != entity and other_entity.lower() in content:
                                    relationships["entities"][entity]["related_entities"].add(other_entity)
        
        # Convert sets to lists for JSON serialization
        for entity_data in relationships["entities"].values():
            entity_data["platforms"] = list(entity_data["platforms"])
            entity_data["related_entities"] = list(entity_data["related_entities"])
            
        # Save relationship index
        with open(self.index_path / "relationships" / "index.json", 'w') as f:
            json.dump(relationships, f, indent=2)
            
        print(f"✅ Relationship index created: {len(relationships['entities'])} entities tracked")
        
    def generate_search_summary(self):
        """Generate executive summary of search capabilities"""
        summary = {
            "generated": datetime.now().isoformat(),
            "search_capabilities": {
                "full_text": "Search across all conversation content with keyword matching",
                "metadata": "Filter by platform, date, word count, and topics", 
                "relationships": "Find connections between people, businesses, and concepts",
                "semantic": "Coming soon - vector embeddings for semantic search"
            },
            "quick_searches": {
                "veriff_crisis": "All conversations about age verification crisis",
                "legislative_strategy": "Texas testimony and SB3/HB28 discussions",
                "business_metrics": "Revenue, growth, and performance discussions",
                "technical_implementation": "API integrations and deployment topics"
            },
            "statistics": {}
        }
        
        # Load statistics from indexes
        try:
            with open(self.index_path / "metadata" / "index.json", 'r') as f:
                metadata = json.load(f)
                summary["statistics"]["total_conversations"] = metadata["summary"]["total_conversations"]
                summary["statistics"]["platforms"] = metadata["summary"]["platforms"]
                summary["statistics"]["date_range"] = metadata["summary"]["date_range"]
        except FileNotFoundError:
            pass
            
        try:
            with open(self.index_path / "full-text" / "index.json", 'r') as f:
                full_text = json.load(f)
                summary["statistics"]["top_keywords"] = dict(
                    sorted(full_text["keywords"].items(), 
                          key=lambda x: x[1]["total"], reverse=True)[:10]
                )
        except FileNotFoundError:
            pass
            
        # Save search summary
        with open(self.index_path / "search_summary.json", 'w') as f:
            json.dump(summary, f, indent=2)
            
        print("✅ Search summary generated")
        
    def run_full_indexing(self):
        """Execute complete indexing process"""
        print("🔍 Starting Liv Hana E2E Search Index Generation...")
        
        # Extract all conversations
        conversations = self.extract_conversations()
        print(f"📥 Extracted {len(conversations)} conversations")
        
        if conversations:
            # Build all indexes
            self.build_full_text_index(conversations)
            self.build_metadata_index(conversations)  
            self.build_relationship_index(conversations)
            self.generate_search_summary()
            
            print("🎯 Search indexing completed successfully!")
            print(f"📊 Results available in: {self.index_path}")
        else:
            print("⚠️  No conversations found - run session harvest first")

if __name__ == "__main__":
    indexer = LivHanaSearchIndexer()
    indexer.run_full_indexing()
```

---
