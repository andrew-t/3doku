import collections

QueueItem = collections.namedtuple('QueueItem', ['priority', 'value'])

class PrioritisedQueue:
	def __init__(self):
		self.queue = collections.deque()

	# priority here is high number = important
	def enqueue(self, item, priority):
		inserted = False
		for i in range(len(self.queue)):
			el = self.queue[i]
			if not inserted:
				if el.value == item:
					return
				if el.priority < priority:
					self.queue.insert(i, QueueItem(priority, item))
					inserted = True
			else:
				if el.value == item:
					self.queue.remove(el)
					return
		if not inserted:
			self.queue.append(QueueItem(priority, item))

	def has_items(self):
		return bool(self.queue)

	def pop(self):
		return self.queue.popleft().value
