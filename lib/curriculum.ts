import { EXTRA_CURRICULUM } from "./extra-words";

export type Lesson = {
  id: string;
  title: string;
  zh: string;
  emoji: string;
  color: string;
  words: { word: string; zh: string; example: string; emoji: string }[];
  quiz: { question: string; options: string[]; answer: string };
};

type WordTuple = [word: string, zh: string, example: string, emoji: string];

function lesson(
  id: string,
  title: string,
  zh: string,
  emoji: string,
  color: string,
  words: WordTuple[],
  question: string,
  options: string[],
  answer: string,
): Lesson {
  return {
    id, title, zh, emoji, color,
    words: words.map(([word, zh, example, emoji]) => ({ word, zh, example, emoji })),
    quiz: { question, options, answer },
  };
}

const BASE_CURRICULUM: Record<number, Lesson[]> = {
  1: [
    lesson("g1-colors", "Happy Colors", "认识颜色", "🎨", "coral", [
      ["red", "红色", "It is red.", "🔴"], ["blue", "蓝色", "It is blue.", "🔵"],
      ["yellow", "黄色", "It is yellow.", "🟡"], ["green", "绿色", "It is green.", "🟢"],
    ], "What color is the sun?", ["blue", "yellow", "green"], "yellow"),
    lesson("g1-family", "My Family", "我的家人", "👨‍👩‍👧", "blue", [
      ["mom", "妈妈", "This is my mom.", "👩"], ["dad", "爸爸", "This is my dad.", "👨"],
      ["sister", "姐妹", "She is my sister.", "👧"], ["brother", "兄弟", "He is my brother.", "👦"],
    ], "Who is your father?", ["dad", "mom", "sister"], "dad"),
    lesson("g1-numbers", "One, Two, Three", "数字朋友", "🔢", "yellow", [
      ["one", "一", "I have one book.", "1️⃣"], ["two", "二", "I have two pens.", "2️⃣"],
      ["three", "三", "I see three cats.", "3️⃣"], ["four", "四", "I see four birds.", "4️⃣"],
    ], "What comes after two?", ["one", "three", "four"], "three"),
  ],
  2: [
    lesson("g2-pets", "Little Pets", "可爱宠物", "🐶", "coral", [
      ["dog", "小狗", "I have a dog.", "🐶"], ["cat", "小猫", "The cat is small.", "🐱"],
      ["fish", "鱼", "The fish can swim.", "🐟"], ["bird", "鸟", "The bird can fly.", "🐦"],
    ], "Which pet can fly?", ["dog", "bird", "fish"], "bird"),
    lesson("g2-fruit", "Fruit Basket", "水果篮子", "🍓", "blue", [
      ["apple", "苹果", "I like apples.", "🍎"], ["banana", "香蕉", "The banana is yellow.", "🍌"],
      ["orange", "橙子", "The orange is sweet.", "🍊"], ["grape", "葡萄", "The grapes are purple.", "🍇"],
    ], "Which fruit is purple?", ["apple", "grape", "banana"], "grape"),
    lesson("g2-weather", "Today's Weather", "今天天气", "☀️", "yellow", [
      ["sunny", "晴朗的", "It is sunny today.", "☀️"], ["rainy", "下雨的", "It is rainy today.", "🌧️"],
      ["windy", "有风的", "It is windy today.", "💨"], ["cloudy", "多云的", "It is cloudy today.", "☁️"],
    ], "When do we need an umbrella?", ["sunny", "rainy", "windy"], "rainy"),
  ],
  3: [
    lesson("g3-animals", "Animal Friends", "动物朋友", "🦁", "coral", [
      ["lion", "狮子", "The lion is strong.", "🦁"], ["panda", "熊猫", "The panda is cute.", "🐼"],
      ["rabbit", "兔子", "The rabbit can jump.", "🐇"], ["elephant", "大象", "The elephant is big.", "🐘"],
    ], "Which animal can jump?", ["lion", "rabbit", "elephant"], "rabbit"),
    lesson("g3-school", "My Classroom", "我的教室", "🏫", "blue", [
      ["book", "书", "This is my book.", "📕"], ["pencil", "铅笔", "I have a pencil.", "✏️"],
      ["teacher", "老师", "My teacher is kind.", "👩‍🏫"], ["desk", "课桌", "The book is on the desk.", "🪑"],
    ], "What do you write with?", ["book", "pencil", "desk"], "pencil"),
    lesson("g3-food", "Yummy Food", "美味食物", "🍎", "yellow", [
      ["apple", "苹果", "I like red apples.", "🍎"], ["milk", "牛奶", "I drink milk.", "🥛"],
      ["bread", "面包", "The bread is fresh.", "🍞"], ["banana", "香蕉", "The banana is yellow.", "🍌"],
    ], "Which food is yellow?", ["milk", "banana", "bread"], "banana"),
  ],
  4: [
    lesson("g4-places", "Around Town", "城市里的地点", "🏙️", "coral", [
      ["library", "图书馆", "I read in the library.", "📚"], ["museum", "博物馆", "We visit the museum.", "🏛️"],
      ["hospital", "医院", "The hospital is nearby.", "🏥"], ["park", "公园", "We play in the park.", "🌳"],
    ], "Where can you borrow books?", ["park", "library", "hospital"], "library"),
    lesson("g4-routines", "My Busy Day", "我的一天", "⏰", "blue", [
      ["breakfast", "早餐", "I eat breakfast at seven.", "🥣"], ["homework", "家庭作业", "I finish my homework.", "📝"],
      ["exercise", "锻炼", "I exercise after school.", "🏃"], ["bedtime", "睡觉时间", "My bedtime is nine.", "🌙"],
    ], "What do you do after school?", ["exercise", "breakfast", "bedtime"], "exercise"),
    lesson("g4-feelings", "How Do You Feel?", "表达心情", "😊", "yellow", [
      ["excited", "兴奋的", "I am excited today.", "🤩"], ["nervous", "紧张的", "I feel nervous before the show.", "😬"],
      ["proud", "自豪的", "I am proud of my work.", "🏅"], ["tired", "疲倦的", "I feel tired after running.", "😴"],
    ], "How might you feel after running?", ["proud", "tired", "excited"], "tired"),
  ],
  5: [
    lesson("g5-nature", "Amazing Nature", "奇妙大自然", "🌿", "coral", [
      ["forest", "森林", "Many animals live in the forest.", "🌲"], ["river", "河流", "The river runs through the valley.", "🏞️"],
      ["mountain", "山", "We can see a tall mountain.", "⛰️"], ["island", "岛屿", "The island is in the sea.", "🏝️"],
    ], "Which place is surrounded by water?", ["forest", "island", "mountain"], "island"),
    lesson("g5-health", "Healthy Habits", "健康习惯", "💪", "blue", [
      ["healthy", "健康的", "Vegetables help us stay healthy.", "🥦"], ["energy", "能量", "Breakfast gives me energy.", "⚡"],
      ["balance", "平衡", "A balanced meal has many foods.", "⚖️"], ["sleep", "睡眠", "Good sleep helps us grow.", "🛌"],
    ], "What helps us grow at night?", ["energy", "sleep", "balance"], "sleep"),
    lesson("g5-hobbies", "Things I Love", "兴趣爱好", "🎨", "yellow", [
      ["painting", "绘画", "Painting helps me express ideas.", "🖌️"], ["cycling", "骑车", "I go cycling on Sundays.", "🚲"],
      ["reading", "阅读", "Reading takes me to new worlds.", "📖"], ["cooking", "烹饪", "I enjoy cooking with my family.", "👩‍🍳"],
    ], "Which hobby uses a bicycle?", ["painting", "cycling", "reading"], "cycling"),
  ],
  6: [
    lesson("g6-environment", "Our Planet", "保护地球", "🌍", "coral", [
      ["recycle", "回收利用", "We recycle paper to save trees.", "♻️"], ["pollution", "污染", "Pollution can harm the ocean.", "🏭"],
      ["protect", "保护", "We should protect wild animals.", "🛡️"], ["resource", "资源", "Water is an important resource.", "💧"],
    ], "What can we do with used paper?", ["recycle", "pollution", "resource"], "recycle"),
    lesson("g6-science", "Science Lab", "科学实验", "🔬", "blue", [
      ["experiment", "实验", "Our experiment answers a question.", "🧪"], ["observe", "观察", "We observe how plants grow.", "🔍"],
      ["result", "结果", "Write down the result.", "📋"], ["discover", "发现", "We discover new things by asking why.", "💡"],
    ], "What should you write down after a test?", ["observe", "result", "discover"], "result"),
    lesson("g6-community", "Our Community", "我们的社区", "🤝", "yellow", [
      ["volunteer", "志愿者", "A volunteer helps other people.", "🙋"], ["neighbor", "邻居", "Our neighbor is very kind.", "🏘️"],
      ["support", "支持", "We support each other.", "🤝"], ["respect", "尊重", "We respect different ideas.", "🌟"],
    ], "Who helps others without being paid?", ["neighbor", "volunteer", "support"], "volunteer"),
  ],
};

export const CURRICULUM: Record<number, Lesson[]> = Object.fromEntries(
  Object.entries(BASE_CURRICULUM).map(([grade, lessons]) => [Number(grade), [...lessons, ...EXTRA_CURRICULUM[Number(grade)]]]),
);

export function lessonsForGrade(grade: number): Lesson[] {
  return CURRICULUM[grade] ?? CURRICULUM[3];
}
