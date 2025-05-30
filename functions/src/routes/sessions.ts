import {Router, Request, Response} from "express";
import admin from "firebase-admin";
import {db, getById} from "../services/firestore";
const router = Router();

/**
 * @openapi
 * /sessions:
 *   post:
 *     summary: 세션 시작
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_id: { type: string }
 *               scenario_id: { type: string }
 *     responses:
 *       200:
 *         description: session ID
 */
router.post("/", async (req: Request, res: Response) => {
  const now = admin.firestore.Timestamp.now();
  const ref = await db.collection("sessions").add({
    ...req.body, 
    start_time: now,
    end_time: null,
    total_attempts: 0,
    total_score: 0,
  });
  return res.json({session_id: ref.id});
});

/**
 * @openapi
 * /sessions/{session_id}:
 *   get:
 *     summary: 세션 조회 (상세 정보 및 퀘스트 결과 포함)
 *     parameters:
 *       - in: path
 *         name: session_id
 *         required: true
 *         schema:
 *           type: string
 *           description: 조회할 세션의 ID
 *     responses:
 *       200:
 *         description: 세션 정보 및 퀘스트 결과
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 session_id:
 *                   type: string
 *                 user_id:
 *                   type: string
 *                 scenario_id:
 *                   type: string
 *                 start_time:
 *                   type: string
 *                   format: date-time
 *                 end_time:
 *                   type: string
 *                   format: date-time
 *                   nullable: true
 *                 total_attempts:
 *                   type: integer
 *                 total_score:
 *                   type: integer
 *                 quests:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       quest_id:
 *                         type: string
 *                       success:
 *                         type: boolean
 *                       attempts:
 *                         type: integer
 */
/** GET /sessions/:id — 세션 조회 + 퀘스트별 결과 포함 */
router.get("/:id", async (req: Request, res: Response) => {
  const sessionId = req.params.id;
  const data = await getById("sessions", sessionId);
  if (!data) return res.status(404).json({ error: "Not found" });

  // 1) sessions 컬렉션에서 기본 세션 정보
  const sessionInfo = { session_id: sessionId, ...data };

  // 2) attempts 컬렉션에서 이 세션의 모든 시도 문서 가져오기
  const attemptsSnap = await db
    .collection("attempts")
    .where("session_id", "==", sessionId)
    .get();

  // 3) quest_id 별로 묶어서 { quest_id, success, attempts } 형태로 가공
  interface QuestResult {
    quest_id: string;
    success: boolean;
    attempts: number;
  }
  const resultMap: Record<string, QuestResult> = {};

  attemptsSnap.docs.forEach((doc) => {
    const { quest_id, is_correct } = doc.data() as {
      quest_id: string;
      is_correct: boolean;
    };
    if (!resultMap[quest_id]) {
      resultMap[quest_id] = { quest_id, success: false, attempts: 0 };
    }
    resultMap[quest_id].attempts += 1;
    // 한번이라도 is_correct === true 면 성공
    if (is_correct) {
      resultMap[quest_id].success = true;
    }
  });

  const quests = Object.values(resultMap);

  return res.json({
    ...sessionInfo,
    quests,
  });
});

export default router;
