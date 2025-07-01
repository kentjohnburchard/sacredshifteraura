import { IModule, ModuleManifest, GESemanticEvent } from '../types';
import { GlobalEventHorizon } from '../services/GlobalEventHorizon';
import React, { useState, useEffect } from 'react';

export interface CommunityThread {
  id: string;
  title: string;
  author: string;
  content: string;
  chakra: string;
  essenceLabels: string[];
  timestamp: string;
  replies: CommunityReply[];
  upvotes: number;
}

export interface CommunityReply {
  id: string;
  author: string;
  content: string;
  timestamp: string;
  upvotes: number;
}

export interface ChakraRoom {
  id: string;
  name: string;
  chakra: string;
  description: string;
  activeMembers: number;
  threads: CommunityThread[];
}

export class SacredCircleModule implements IModule {
  private manifest: ModuleManifest;
  private geh: GlobalEventHorizon;
  private isInitialized = false;
  private isActive = false;
  private chakraRooms: Map<string, ChakraRoom> = new Map();
  private userXP: Map<string, number> = new Map();

  constructor(manifest: ModuleManifest) {
    this.manifest = manifest;
    this.geh = GlobalEventHorizon.getInstance();
    this.initializeMockData();
  }

  getManifest(): ModuleManifest {
    return this.manifest;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    this.geh.publish({
      type: 'module:sacred-circle:initializing',
      sourceId: this.manifest.id,
      timestamp: new Date().toISOString(),
      payload: { status: 'starting' },
      metadata: { moduleName: this.manifest.name },
      essenceLabels: ['module:initialization', 'community:preparation']
    });

    // Initialize community data structures
    this.setupEventListeners();
    
    this.isInitialized = true;

    this.geh.publish({
      type: 'module:sacred-circle:initialized',
      sourceId: this.manifest.id,
      timestamp: new Date().toISOString(),
      payload: { status: 'ready', roomCount: this.chakraRooms.size },
      metadata: { moduleName: this.manifest.name },
      essenceLabels: ['module:ready', 'community:available']
    });
  }

  async activate(): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('Module must be initialized before activation');
    }

    this.isActive = true;

    this.geh.publish({
      type: 'module:sacred-circle:activated',
      sourceId: this.manifest.id,
      timestamp: new Date().toISOString(),
      payload: { status: 'active', features: ['community-forum', 'chakra-rooms', 'xp-tracking'] },
      metadata: { moduleName: this.manifest.name },
      essenceLabels: ['module:active', 'community:open', 'temple:digital']
    });
  }

  async deactivate(): Promise<void> {
    this.isActive = false;

    this.geh.publish({
      type: 'module:sacred-circle:deactivated',
      sourceId: this.manifest.id,
      timestamp: new Date().toISOString(),
      payload: { status: 'dormant' },
      metadata: { moduleName: this.manifest.name },
      essenceLabels: ['module:dormant', 'community:paused']
    });
  }

  async destroy(): Promise<void> {
    this.isActive = false;
    this.isInitialized = false;
    this.chakraRooms.clear();
    this.userXP.clear();

    this.geh.publish({
      type: 'module:sacred-circle:destroyed',
      sourceId: this.manifest.id,
      timestamp: new Date().toISOString(),
      payload: { status: 'destroyed' },
      metadata: { moduleName: this.manifest.name },
      essenceLabels: ['module:destroyed', 'community:closed']
    });
  }

  ping(): boolean {
    return this.isActive;
  }

  getExposedItems(): Record<string, any> {
    return {
      CommunityService: {
        getAllRooms: () => Array.from(this.chakraRooms.values()),
        getRoom: (roomId: string) => this.chakraRooms.get(roomId),
        createThread: (roomId: string, thread: Omit<CommunityThread, 'id' | 'timestamp' | 'replies' | 'upvotes'>) => this.createThread(roomId, thread),
        addReply: (threadId: string, reply: Omit<CommunityReply, 'id' | 'timestamp' | 'upvotes'>) => this.addReply(threadId, reply),
        upvoteThread: (threadId: string) => this.upvoteThread(threadId),
        getUserXP: (userId: string) => this.userXP.get(userId) || 0
      },
      GroupThreadManager: {
        getThreadsByChakra: (chakra: string) => this.getThreadsByChakra(chakra),
        getPopularThreads: () => this.getPopularThreads()
      },
      ChakraRoomService: {
        getRoomsByChakra: () => this.getRoomsByChakra(),
        joinRoom: (roomId: string, userId: string) => this.joinRoom(roomId, userId)
      },
      XPTracker: {
        addXP: (userId: string, amount: number, reason: string) => this.addXP(userId, amount, reason),
        getLeaderboard: () => this.getLeaderboard()
      },
      // Expose React component
      Component: () => {
        const SacredCircleComponent = () => {
          const [rooms, setRooms] = useState<ChakraRoom[]>([]);
          const [selectedRoom, setSelectedRoom] = useState<ChakraRoom | null>(null);
          const [newThread, setNewThread] = useState({ title: '', content: '', author: 'Anonymous User' });
          const [newReply, setNewReply] = useState({ content: '', author: 'Anonymous User', threadId: '' });

          useEffect(() => {
            setRooms(Array.from(this.chakraRooms.values()));
          }, []);

          const handleCreateThread = (roomId: string) => {
            if (newThread.title && newThread.content) {
              this.createThread(roomId, {
                title: newThread.title,
                author: newThread.author,
                content: newThread.content,
                chakra: selectedRoom?.chakra || 'muladhara',
                essenceLabels: ['community:discussion', 'user:contribution']
              });
              setNewThread({ title: '', content: '', author: 'Anonymous User' });
              // Refresh rooms
              setRooms(Array.from(this.chakraRooms.values()));
              if (selectedRoom) {
                setSelectedRoom(this.chakraRooms.get(selectedRoom.id) || null);
              }
            }
          };

          const handleAddReply = (threadId: string) => {
            if (newReply.content) {
              this.addReply(threadId, {
                author: newReply.author,
                content: newReply.content
              });
              setNewReply({ content: '', author: 'Anonymous User', threadId: '' });
              // Refresh rooms
              setRooms(Array.from(this.chakraRooms.values()));
              if (selectedRoom) {
                setSelectedRoom(this.chakraRooms.get(selectedRoom.id) || null);
              }
            }
          };

          return React.createElement('div', {
            className: 'space-y-6'
          }, [
            // Header
            React.createElement('div', {
              key: 'header',
              className: 'bg-slate-900/50 rounded-xl border border-purple-500/20 p-6'
            }, [
              React.createElement('h2', {
                key: 'title',
                className: 'text-2xl font-bold text-white mb-4'
              }, '🌸 Sacred Circle Community'),
              React.createElement('p', {
                key: 'desc',
                className: 'text-purple-300'
              }, 'Connect with fellow souls on their spiritual journey through chakra-aligned discussions.')
            ]),

            // Rooms Grid
            React.createElement('div', {
              key: 'rooms-section',
              className: 'bg-slate-900/50 rounded-xl border border-purple-500/20 p-6'
            }, [
              React.createElement('h3', {
                key: 'rooms-title',
                className: 'text-xl font-semibold text-white mb-4'
              }, 'Chakra Rooms'),
              React.createElement('div', {
                key: 'rooms-grid',
                className: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6'
              }, rooms.map(room => 
                React.createElement('div', {
                  key: room.id,
                  className: `p-4 bg-slate-800/50 rounded-lg border border-purple-500/20 cursor-pointer transition-all hover:border-purple-400 ${selectedRoom?.id === room.id ? 'border-purple-400 bg-purple-900/20' : ''}`,
                  onClick: () => setSelectedRoom(room)
                }, [
                  React.createElement('h4', {
                    key: 'name',
                    className: 'font-bold text-white'
                  }, room.name),
                  React.createElement('p', {
                    key: 'desc',
                    className: 'text-sm text-gray-400 mb-2'
                  }, room.description),
                  React.createElement('div', {
                    key: 'stats',
                    className: 'flex justify-between text-xs'
                  }, [
                    React.createElement('span', {
                      key: 'members',
                      className: 'text-purple-300'
                    }, `${room.activeMembers} members`),
                    React.createElement('span', {
                      key: 'threads',
                      className: 'text-purple-300'
                    }, `${room.threads.length} threads`)
                  ])
                ])
              ))
            ]),

            // Selected Room Details
            selectedRoom && React.createElement('div', {
              key: 'room-details',
              className: 'bg-slate-900/50 rounded-xl border border-purple-500/20 p-6'
            }, [
              React.createElement('h3', {
                key: 'room-title',
                className: 'text-xl font-semibold text-white mb-4'
              }, `${selectedRoom.name} - Discussions`),

              // Create Thread Form
              React.createElement('div', {
                key: 'create-thread',
                className: 'mb-6 p-4 bg-slate-800/50 rounded-lg border border-purple-500/20'
              }, [
                React.createElement('h4', {
                  key: 'form-title',
                  className: 'text-lg font-medium text-white mb-3'
                }, 'Start New Discussion'),
                React.createElement('input', {
                  key: 'thread-title',
                  type: 'text',
                  placeholder: 'Thread title...',
                  value: newThread.title,
                  onChange: (e: any) => setNewThread({...newThread, title: e.target.value}),
                  className: 'w-full p-3 mb-3 bg-slate-700 text-white rounded border border-gray-600 focus:border-purple-400 focus:outline-none'
                }),
                React.createElement('textarea', {
                  key: 'thread-content',
                  placeholder: 'Share your thoughts...',
                  value: newThread.content,
                  onChange: (e: any) => setNewThread({...newThread, content: e.target.value}),
                  className: 'w-full p-3 mb-3 bg-slate-700 text-white rounded border border-gray-600 focus:border-purple-400 focus:outline-none h-24'
                }),
                React.createElement('input', {
                  key: 'thread-author',
                  type: 'text',
                  placeholder: 'Your name...',
                  value: newThread.author,
                  onChange: (e: any) => setNewThread({...newThread, author: e.target.value}),
                  className: 'w-full p-3 mb-3 bg-slate-700 text-white rounded border border-gray-600 focus:border-purple-400 focus:outline-none'
                }),
                React.createElement('button', {
                  key: 'submit-thread',
                  onClick: () => handleCreateThread(selectedRoom.id),
                  className: 'px-6 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors'
                }, 'Create Thread')
              ]),

              // Threads List
              React.createElement('div', {
                key: 'threads-list',
                className: 'space-y-4'
              }, selectedRoom.threads.map(thread =>
                React.createElement('div', {
                  key: thread.id,
                  className: 'p-4 bg-slate-800/50 rounded-lg border border-gray-600'
                }, [
                  React.createElement('div', {
                    key: 'thread-header',
                    className: 'flex justify-between items-start mb-2'
                  }, [
                    React.createElement('h5', {
                      key: 'thread-title',
                      className: 'font-bold text-white'
                    }, thread.title),
                    React.createElement('span', {
                      key: 'thread-votes',
                      className: 'text-purple-300 text-sm'
                    }, `❤️ ${thread.upvotes}`)
                  ]),
                  React.createElement('p', {
                    key: 'thread-content',
                    className: 'text-gray-300 mb-2'
                  }, thread.content),
                  React.createElement('div', {
                    key: 'thread-meta',
                    className: 'text-xs text-gray-400 mb-3'
                  }, `By ${thread.author} • ${new Date(thread.timestamp).toLocaleDateString()}`),
                  
                  // Replies
                  thread.replies.length > 0 && React.createElement('div', {
                    key: 'replies',
                    className: 'ml-4 space-y-2 mb-3'
                  }, thread.replies.map(reply =>
                    React.createElement('div', {
                      key: reply.id,
                      className: 'p-2 bg-slate-700/50 rounded border-l-2 border-purple-500'
                    }, [
                      React.createElement('p', {
                        key: 'reply-content',
                        className: 'text-gray-300 text-sm'
                      }, reply.content),
                      React.createElement('div', {
                        key: 'reply-meta',
                        className: 'text-xs text-gray-400 mt-1'
                      }, `${reply.author} • ${new Date(reply.timestamp).toLocaleDateString()}`)
                    ])
                  )),

                  // Reply Form
                  React.createElement('div', {
                    key: 'reply-form',
                    className: 'mt-3 space-y-2'
                  }, [
                    React.createElement('textarea', {
                      key: 'reply-content',
                      placeholder: 'Add your reply...',
                      value: newReply.threadId === thread.id ? newReply.content : '',
                      onChange: (e: any) => setNewReply({...newReply, content: e.target.value, threadId: thread.id}),
                      className: 'w-full p-2 bg-slate-700 text-white rounded border border-gray-600 focus:border-purple-400 focus:outline-none text-sm h-16'
                    }),
                    React.createElement('div', {
                      key: 'reply-actions',
                      className: 'flex gap-2'
                    }, [
                      React.createElement('input', {
                        key: 'reply-author',
                        type: 'text',
                        placeholder: 'Your name...',
                        value: newReply.threadId === thread.id ? newReply.author : 'Anonymous User',
                        onChange: (e: any) => setNewReply({...newReply, author: e.target.value, threadId: thread.id}),
                        className: 'flex-1 p-2 bg-slate-700 text-white rounded border border-gray-600 focus:border-purple-400 focus:outline-none text-sm'
                      }),
                      React.createElement('button', {
                        key: 'submit-reply',
                        onClick: () => handleAddReply(thread.id),
                        className: 'px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors text-sm'
                      }, 'Reply')
                    ])
                  ])
                ])
              ))
            ])
          ]);
        };

        return SacredCircleComponent;
      }
    };
  }

  private initializeMockData(): void {
    const chakras = [
      { id: 'root', name: 'Root Chakra', chakra: 'muladhara', description: 'Grounding, survival, and stability discussions' },
      { id: 'sacral', name: 'Sacral Chakra', chakra: 'svadhisthana', description: 'Creativity, sexuality, and emotional flow' },
      { id: 'solar', name: 'Solar Plexus', chakra: 'manipura', description: 'Personal power, confidence, and transformation' },
      { id: 'heart', name: 'Heart Chakra', chakra: 'anahata', description: 'Love, compassion, and connection' },
      { id: 'throat', name: 'Throat Chakra', chakra: 'vishuddha', description: 'Communication, truth, and expression' },
      { id: 'third-eye', name: 'Third Eye', chakra: 'ajna', description: 'Intuition, insight, and spiritual vision' },
      { id: 'crown', name: 'Crown Chakra', chakra: 'sahasrara', description: 'Divine connection and enlightenment' }
    ];

    chakras.forEach(chakra => {
      const room: ChakraRoom = {
        id: chakra.id,
        name: chakra.name,
        chakra: chakra.chakra,
        description: chakra.description,
        activeMembers: Math.floor(Math.random() * 50) + 10,
        threads: []
      };

      // Add sample threads
      for (let i = 0; i < 3; i++) {
        const thread: CommunityThread = {
          id: `${chakra.id}-thread-${i}`,
          title: `${chakra.name} Discussion ${i + 1}`,
          author: `SacredSeeker${i + 1}`,
          content: `Exploring the depths of ${chakra.name} energy and its manifestations...`,
          chakra: chakra.chakra,
          essenceLabels: [`chakra:${chakra.chakra}`, 'community:discussion', 'growth:spiritual'],
          timestamp: new Date(Date.now() - Math.random() * 86400000).toISOString(),
          replies: [],
          upvotes: Math.floor(Math.random() * 20)
        };
        room.threads.push(thread);
      }

      this.chakraRooms.set(chakra.id, room);
    });
  }

  private setupEventListeners(): void {
    // Listen for user actions to award XP
    this.geh.subscribe('user:action', (event: GESemanticEvent) => {
      if (event.essenceLabels.includes('community:interaction')) {
        const userId = event.payload?.userId || 'anonymous';
        this.addXP(userId, 5, 'community_interaction');
      }
    });
  }

  private createThread(roomId: string, threadData: Omit<CommunityThread, 'id' | 'timestamp' | 'replies' | 'upvotes'>): string {
    const room = this.chakraRooms.get(roomId);
    if (!room) throw new Error('Room not found');

    const thread: CommunityThread = {
      ...threadData,
      id: `${roomId}-thread-${Date.now()}`,
      timestamp: new Date().toISOString(),
      replies: [],
      upvotes: 0
    };

    room.threads.push(thread);

    this.geh.publish({
      type: 'community:thread:created',
      sourceId: this.manifest.id,
      timestamp: new Date().toISOString(),
      payload: { threadId: thread.id, roomId, title: thread.title },
      metadata: { author: thread.author },
      essenceLabels: ['community:creation', `chakra:${thread.chakra}`, 'user:contribution']
    });

    this.addXP(thread.author, 10, 'thread_creation');
    return thread.id;
  }

  private addReply(threadId: string, replyData: Omit<CommunityReply, 'id' | 'timestamp' | 'upvotes'>): string {
    for (const room of this.chakraRooms.values()) {
      const thread = room.threads.find(t => t.id === threadId);
      if (thread) {
        const reply: CommunityReply = {
          ...replyData,
          id: `${threadId}-reply-${Date.now()}`,
          timestamp: new Date().toISOString(),
          upvotes: 0
        };

        thread.replies.push(reply);

        this.geh.publish({
          type: 'community:reply:created',
          sourceId: this.manifest.id,
          timestamp: new Date().toISOString(),
          payload: { replyId: reply.id, threadId },
          metadata: { author: reply.author },
          essenceLabels: ['community:interaction', 'user:engagement']
        });

        this.addXP(reply.author, 5, 'reply_creation');
        return reply.id;
      }
    }
    throw new Error('Thread not found');
  }

  private upvoteThread(threadId: string): void {
    for (const room of this.chakraRooms.values()) {
      const thread = room.threads.find(t => t.id === threadId);
      if (thread) {
        thread.upvotes++;
        this.geh.publish({
          type: 'community:thread:upvoted',
          sourceId: this.manifest.id,
          timestamp: new Date().toISOString(),
          payload: { threadId, upvotes: thread.upvotes },
          metadata: { title: thread.title },
          essenceLabels: ['community:appreciation', 'user:validation']
        });
        return;
      }
    }
  }

  private addXP(userId: string, amount: number, reason: string): void {
    const currentXP = this.userXP.get(userId) || 0;
    this.userXP.set(userId, currentXP + amount);

    this.geh.publish({
      type: 'community:xp:awarded',
      sourceId: this.manifest.id,
      timestamp: new Date().toISOString(),
      payload: { userId, amount, reason, totalXP: currentXP + amount },
      metadata: { achievement: reason },
      essenceLabels: ['user:growth', 'community:reward', 'progress:spiritual']
    });
  }

  private getThreadsByChakra(chakra: string): CommunityThread[] {
    const threads: CommunityThread[] = [];
    for (const room of this.chakraRooms.values()) {
      threads.push(...room.threads.filter(t => t.chakra === chakra));
    }
    return threads.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  private getPopularThreads(): CommunityThread[] {
    const allThreads: CommunityThread[] = [];
    for (const room of this.chakraRooms.values()) {
      allThreads.push(...room.threads);
    }
    return allThreads.sort((a, b) => b.upvotes - a.upvotes).slice(0, 10);
  }

  private getRoomsByChakra(): ChakraRoom[] {
    return Array.from(this.chakraRooms.values());
  }

  private joinRoom(roomId: string, userId: string): boolean {
    const room = this.chakraRooms.get(roomId);
    if (room) {
      room.activeMembers++;
      this.geh.publish({
        type: 'community:room:joined',
        sourceId: this.manifest.id,
        timestamp: new Date().toISOString(),
        payload: { roomId, userId, activeMembers: room.activeMembers },
        metadata: { roomName: room.name },
        essenceLabels: ['community:engagement', `chakra:${room.chakra}`, 'user:connection']
      });
      return true;
    }
    return false;
  }

  private getLeaderboard(): Array<{ userId: string; xp: number; rank: number }> {
    return Array.from(this.userXP.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([userId, xp], index) => ({ userId, xp, rank: index + 1 }));
  }
}