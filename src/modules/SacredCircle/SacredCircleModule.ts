import { IModule, ModuleManifest, GESemanticEvent } from '../../types';
import { GlobalEventHorizon } from '../../services/GlobalEventHorizon';
import React, { useState, useEffect } from 'react';
import { CircleList } from './components/CircleList';
import { SacredCircle } from './components/SacredCircle';
import { SacredCirclePanel } from './components/SacredCirclePanel';
import { SacredCircleWelcome } from './components/SacredCircleWelcome';
import { UserPresencePanel } from './components/UserPresencePanel';

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
      // Expose React components
      Components: {
        SacredCircle,
        CircleList,
        SacredCirclePanel,
        SacredCircleWelcome,
        UserPresencePanel
      },
      Component: () => SacredCircle
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