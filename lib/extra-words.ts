import type { Lesson } from "./curriculum";

// Independently written practice vocabulary. These are NOT asserted to be
// the official word lists of any particular edition of the PEP textbook.
type Entry = [word: string, zh: string, emoji: string, example: string];
type Theme = [id: string, title: string, zh: string, emoji: string, entries: Entry[]];

function makeLesson(grade: number, theme: Theme, index: number): Lesson {
  const [id, title, zh, emoji, entries] = theme;
  const words = entries.map(([word, meaning, icon, example]) => ({ word, zh: meaning, emoji: icon, example }));
  return {
    id: `g${grade}-extra-${id}`, title, zh, emoji,
    color: (["coral", "blue", "yellow"] as const)[index % 3],
    words,
    quiz: { question: `“${words[0].zh}”用英语怎么说？`, options: words.slice(0, 3).map(w => w.word), answer: words[0].word },
  };
}

const THEMES: Record<number, Theme[]> = {
  1: [
    ["school", "At School", "学校用品", "🎒", [
      ["bag", "书包", "🎒", "This is my bag."], ["pen", "钢笔", "🖊️", "I have a pen."],
      ["pencil", "铅笔", "✏️", "This is a pencil."], ["book", "书", "📕", "Open your book."],
      ["ruler", "尺子", "📏", "My ruler is long."], ["desk", "课桌", "🪑", "This is my desk."],
      ["chair", "椅子", "🪑", "Sit on the chair."], ["school", "学校", "🏫", "I go to school."],
    ]],
    ["body", "My Body", "身体部位", "🙋", [
      ["head", "头", "🙂", "Touch your head."], ["hair", "头发", "💇", "My hair is black."],
      ["eye", "眼睛", "👁️", "Close one eye."], ["ear", "耳朵", "👂", "Touch your ear."],
      ["nose", "鼻子", "👃", "This is my nose."], ["mouth", "嘴巴", "👄", "Open your mouth."],
      ["hand", "手", "✋", "Raise your hand."], ["foot", "脚", "🦶", "This is my foot."],
    ]],
    ["animals", "Animal Friends", "动物朋友", "🐾", [
      ["cat", "猫", "🐱", "The cat is small."], ["dog", "狗", "🐶", "The dog can run."],
      ["bird", "鸟", "🐦", "The bird can fly."], ["fish", "鱼", "🐟", "The fish can swim."],
      ["duck", "鸭子", "🦆", "The duck is yellow."], ["pig", "猪", "🐷", "The pig is pink."],
      ["cow", "奶牛", "🐄", "The cow is big."], ["rabbit", "兔子", "🐰", "The rabbit can jump."],
    ]],
    ["food", "Yummy Food", "食物水果", "🍎", [
      ["apple", "苹果", "🍎", "I like apples."], ["banana", "香蕉", "🍌", "I like bananas."],
      ["orange", "橙子", "🍊", "The orange is sweet."], ["pear", "梨", "🍐", "This pear is green."],
      ["milk", "牛奶", "🥛", "I drink milk."], ["egg", "鸡蛋", "🥚", "I have an egg."],
      ["rice", "米饭", "🍚", "I eat rice."], ["bread", "面包", "🍞", "I like bread."],
    ]],
  ],
  2: [
    ["family", "My Family", "家人与朋友", "👪", [
      ["mother", "妈妈", "👩", "This is my mother."], ["father", "爸爸", "👨", "This is my father."],
      ["grandma", "奶奶；外婆", "👵", "My grandma is kind."], ["grandpa", "爷爷；外公", "👴", "My grandpa likes tea."],
      ["aunt", "阿姨；姑姑", "👩", "My aunt is here."], ["uncle", "叔叔；舅舅", "👨", "My uncle can cook."],
      ["friend", "朋友", "🤝", "She is my friend."], ["baby", "婴儿", "👶", "The baby is sleeping."],
    ]],
    ["clothes", "My Clothes", "我的衣服", "👕", [
      ["shirt", "衬衫", "👕", "My shirt is blue."], ["dress", "连衣裙", "👗", "This dress is red."],
      ["coat", "外套", "🧥", "Put on your coat."], ["hat", "帽子", "🧢", "I have a hat."],
      ["shoes", "鞋子", "👟", "My shoes are new."], ["socks", "袜子", "🧦", "These are my socks."],
      ["skirt", "半身裙", "👗", "Her skirt is yellow."], ["shorts", "短裤", "🩳", "I wear shorts."],
    ]],
    ["home", "At Home", "家里的物品", "🏠", [
      ["door", "门", "🚪", "Open the door."], ["window", "窗户", "🪟", "Close the window."],
      ["table", "桌子", "🪑", "The book is on the table."], ["bed", "床", "🛏️", "This is my bed."],
      ["lamp", "台灯", "💡", "The lamp is bright."], ["sofa", "沙发", "🛋️", "Sit on the sofa."],
      ["room", "房间", "🏠", "My room is clean."], ["kitchen", "厨房", "🍳", "Mom is in the kitchen."],
    ]],
    ["play", "Let's Play", "游戏与动作", "🪁", [
      ["run", "跑", "🏃", "I can run."], ["jump", "跳", "🦘", "I can jump."],
      ["sing", "唱歌", "🎤", "Let's sing a song."], ["dance", "跳舞", "💃", "I like to dance."],
      ["swim", "游泳", "🏊", "Fish can swim."], ["draw", "画画", "🖍️", "I can draw a cat."],
      ["play", "玩", "🪁", "Let's play together."], ["ball", "球", "⚽", "I have a ball."],
    ]],
  ],
  3: [
    ["people", "People Around Me", "身边的人", "🧑‍🤝‍🧑", [
      ["student", "学生", "🧑‍🎓", "I am a student."], ["classmate", "同学", "🧑‍🤝‍🧑", "She is my classmate."],
      ["boy", "男孩", "👦", "The boy is happy."], ["girl", "女孩", "👧", "The girl can sing."],
      ["woman", "女人", "👩", "The woman is a teacher."], ["man", "男人", "👨", "The man is tall."],
      ["child", "孩子", "🧒", "Every child can learn."], ["teacher", "老师", "👩‍🏫", "Our teacher is kind."],
    ]],
    ["colors", "More Colors", "更多颜色", "🖍️", [
      ["red", "红色", "🔴", "The apple is red."], ["blue", "蓝色", "🔵", "The sky is blue."],
      ["green", "绿色", "🟢", "The leaf is green."], ["yellow", "黄色", "🟡", "The sun is yellow."],
      ["black", "黑色", "⚫", "My bag is black."], ["white", "白色", "⚪", "The snow is white."],
      ["pink", "粉色", "🩷", "The flower is pink."], ["purple", "紫色", "🟣", "The grapes are purple."],
    ]],
    ["numbers", "Numbers 5–12", "数字五到十二", "🔢", [
      ["five", "五", "5️⃣", "I have five pencils."], ["six", "六", "6️⃣", "Six birds are here."],
      ["seven", "七", "7️⃣", "I am seven years old."], ["eight", "八", "8️⃣", "There are eight books."],
      ["nine", "九", "9️⃣", "I see nine ducks."], ["ten", "十", "🔟", "I have ten fingers."],
      ["eleven", "十一", "🔢", "There are eleven apples."], ["twelve", "十二", "🔢", "There are twelve months."],
    ]],
    ["toys", "Toy Box", "玩具箱", "🧸", [
      ["toy", "玩具", "🧸", "This is my toy."], ["doll", "玩偶", "🪆", "I have a doll."],
      ["kite", "风筝", "🪁", "Fly the kite."], ["car", "玩具汽车；汽车", "🚗", "The car is red."],
      ["train", "火车", "🚂", "The train is long."], ["plane", "飞机", "✈️", "The plane can fly."],
      ["robot", "机器人", "🤖", "My robot can walk."], ["game", "游戏", "🎲", "Let's play a game."],
    ]],
  ],
  4: [
    ["subjects", "School Subjects", "学校课程", "📚", [
      ["English", "英语", "🔤", "I like English."], ["math", "数学", "➕", "Math is fun."],
      ["music", "音乐", "🎵", "We sing in music class."], ["art", "美术", "🎨", "I draw in art class."],
      ["science", "科学", "🔬", "Science is interesting."], ["history", "历史", "📜", "We learn about history."],
      ["class", "课程", "🏫", "Our class starts now."], ["homework", "家庭作业", "📝", "I do my homework."],
    ]],
    ["time", "Time and Day", "时间与星期", "🕒", [
      ["morning", "早晨", "🌅", "Good morning!"], ["afternoon", "下午", "☀️", "Good afternoon!"],
      ["evening", "傍晚", "🌆", "Good evening!"], ["night", "夜晚", "🌙", "Good night!"],
      ["today", "今天", "📅", "Today is sunny."], ["tomorrow", "明天", "🗓️", "See you tomorrow."],
      ["Monday", "星期一", "📆", "Monday is a school day."], ["Sunday", "星期日", "📆", "I play on Sunday."],
    ]],
    ["weather", "Weather Watch", "天气观察", "🌤️", [
      ["sunny", "晴朗的", "☀️", "It is sunny today."], ["rainy", "下雨的", "🌧️", "It is rainy today."],
      ["windy", "有风的", "💨", "It is windy outside."], ["cloudy", "多云的", "☁️", "It is cloudy now."],
      ["snowy", "下雪的", "❄️", "It is snowy in winter."], ["hot", "热的", "🥵", "It is hot today."],
      ["cold", "冷的", "🥶", "It is cold outside."], ["warm", "温暖的", "🌤️", "The room is warm."],
    ]],
    ["sports", "Sports Time", "运动时间", "🏀", [
      ["football", "足球", "⚽", "We play football."], ["basketball", "篮球", "🏀", "I like basketball."],
      ["tennis", "网球", "🎾", "She plays tennis."], ["skating", "滑冰", "⛸️", "Skating is fun."],
      ["running", "跑步", "🏃", "Running is good for us."], ["riding", "骑行", "🚲", "I like riding a bike."],
      ["team", "队伍", "👥", "We are a team."], ["win", "获胜", "🏆", "We want to win."],
    ]],
  ],
  5: [
    ["seasons", "Four Seasons", "四季", "🍂", [
      ["spring", "春天", "🌷", "Flowers bloom in spring."], ["summer", "夏天", "☀️", "Summer is hot."],
      ["autumn", "秋天", "🍁", "Leaves fall in autumn."], ["winter", "冬天", "❄️", "Winter is cold."],
      ["flower", "花", "🌸", "This flower is pink."], ["leaf", "叶子", "🍃", "The leaf is green."],
      ["snow", "雪", "☃️", "I like the snow."], ["season", "季节", "🗓️", "My favourite season is spring."],
    ]],
    ["jobs", "People at Work", "人们的工作", "🧑‍⚕️", [
      ["doctor", "医生", "🩺", "The doctor helps people."], ["nurse", "护士", "👩‍⚕️", "The nurse is kind."],
      ["farmer", "农民", "👩‍🌾", "The farmer grows food."], ["driver", "司机", "🚌", "The driver drives a bus."],
      ["cook", "厨师", "👩‍🍳", "The cook makes lunch."], ["artist", "艺术家", "🎨", "The artist paints pictures."],
      ["worker", "工人", "👷", "The worker builds houses."], ["pilot", "飞行员", "👩‍✈️", "The pilot flies a plane."],
    ]],
    ["travel", "Let's Travel", "旅行出行", "🧳", [
      ["travel", "旅行", "🧳", "I want to travel."], ["bus", "公共汽车", "🚌", "I go by bus."],
      ["subway", "地铁", "🚇", "The subway is fast."], ["station", "车站", "🚉", "Meet me at the station."],
      ["ticket", "票", "🎫", "I have a ticket."], ["map", "地图", "🗺️", "Look at the map."],
      ["hotel", "旅馆", "🏨", "We stay at a hotel."], ["trip", "旅行", "🚆", "Our trip is fun."],
    ]],
    ["chores", "Helping at Home", "帮忙做家务", "🧹", [
      ["clean", "打扫", "🧽", "I clean my room."], ["wash", "洗", "🫧", "I wash my hands."],
      ["sweep", "扫", "🧹", "I sweep the floor."], ["tidy", "整理", "🧺", "I tidy my desk."],
      ["help", "帮助", "🤝", "I help my family."], ["dishes", "餐具", "🍽️", "I wash the dishes."],
      ["laundry", "待洗衣物", "🧺", "I fold the laundry."], ["garden", "花园", "🌻", "We work in the garden."],
    ]],
  ],
  6: [
    ["feelings", "Feelings", "感受与情绪", "😊", [
      ["happy", "开心的", "😊", "I feel happy today."], ["sad", "难过的", "😢", "My friend feels sad."],
      ["angry", "生气的", "😠", "Take a breath when angry."], ["worried", "担心的", "😟", "I feel worried."],
      ["excited", "兴奋的", "🤩", "We are excited."], ["proud", "自豪的", "🏅", "I am proud of you."],
      ["calm", "平静的", "😌", "I feel calm now."], ["kind", "友善的", "💗", "Be kind to others."],
    ]],
    ["earth", "Our Earth", "我们的地球", "🌍", [
      ["earth", "地球", "🌍", "We live on Earth."], ["ocean", "海洋", "🌊", "The ocean is blue."],
      ["river", "河流", "🏞️", "The river is long."], ["forest", "森林", "🌲", "Many animals live in the forest."],
      ["plant", "植物", "🌱", "This plant needs water."], ["air", "空气", "💨", "We need clean air."],
      ["water", "水", "💧", "Save water every day."], ["nature", "自然", "🌿", "I love nature."],
    ]],
    ["technology", "Technology", "科技与学习", "💻", [
      ["computer", "计算机", "💻", "I use a computer."], ["screen", "屏幕", "🖥️", "Look at the screen."],
      ["keyboard", "键盘", "⌨️", "This is a keyboard."], ["camera", "相机", "📷", "I have a camera."],
      ["message", "消息", "💬", "I send a message."], ["website", "网站", "🌐", "This website is useful."],
      ["search", "搜索", "🔎", "Search for a word."], ["online", "在线的", "📶", "Our class is online."],
    ]],
    ["future", "My Future", "我的未来", "🚀", [
      ["future", "未来", "🚀", "I think about my future."], ["dream", "梦想", "💭", "I have a dream."],
      ["plan", "计划", "📝", "We make a plan."], ["learn", "学习", "📚", "I learn something new."],
      ["create", "创造", "🎨", "We can create a story."], ["try", "尝试", "💪", "I will try again."],
      ["goal", "目标", "🎯", "My goal is to read more."], ["grow", "成长", "🌱", "We grow every day."],
    ]],
  ],
};

export const EXTRA_CURRICULUM: Record<number, Lesson[]> = Object.fromEntries(
  Object.entries(THEMES).map(([grade, themes]) => [Number(grade), themes.map((theme, index) => makeLesson(Number(grade), theme, index))]),
);
