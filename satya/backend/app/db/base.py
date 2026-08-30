"""
Import all models here so Alembic can detect them for migrations.
"""
from app.db.session import Base  # noqa: F401
from app.models.user import User  # noqa: F401
from app.models.entrepreneur import EntrepreneurProfile  # noqa: F401
from app.models.customer import CustomerProfile  # noqa: F401
from app.models.business import BusinessProfile, BusinessPlan, Product, Service  # noqa: F401
from app.models.marketplace import Order, OrderItem, Review  # noqa: F401
from app.models.promotion import PromotionCampaign  # noqa: F401
from app.models.voice import VoiceSession  # noqa: F401
from app.models.financial import FinancialPlan  # noqa: F401
from app.models.market import MarketData  # noqa: F401
from app.models.scheme import GovernmentScheme, GovernmentDocument, SchemeEmbedding  # noqa: F401
from app.models.network import Mentor, Supplier, Buyer, Organization  # noqa: F401
from app.models.farmer import FarmerProfile, AgriFinancialRecord  # noqa: F401
from app.models.connection import ConnectionRequest, Message, Notification  # noqa: F401
from app.models.ai_log import AIConversation, AIConversationMessage, AIExecutionLog, Recommendation  # noqa: F401

