'use client';

import { useState, useEffect } from 'react';
import { moderationApi } from '@/lib/api';
import { ProcessedPost } from '@/types/moderation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

interface ModerationPanelProps {
  scheduleId: string;
}

export function ModerationPanel({ scheduleId }: ModerationPanelProps) {
  const [posts, setPosts] = useState<ProcessedPost[]>([]);
  const [editingPost, setEditingPost] = useState<ProcessedPost | null>(null);

  useEffect(() => {
    loadPosts();
  }, [scheduleId]);

  const loadPosts = async () => {
    const data = await moderationApi.getPosts({ scheduleId, moderationStatus: 'pending' });
    console.log(data);
    setPosts(data?.data || []);
  };

  const handleApprove = async (postId: string) => {
    await moderationApi.approvePost(postId);
    await loadPosts();
  };

  const handleReject = async (postId: string) => {
    await moderationApi.rejectPost(postId);
    await loadPosts();
  };

  const handleSaveContent = async () => {
    if (!editingPost) return;
    await moderationApi.updatePostContent(editingPost.id, editingPost.content);
    setEditingPost(null);
    await loadPosts();
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-4">Модерация постов</h2>
      
      {editingPost ? (
        <Card className="p-4 space-y-4">
          <Textarea
            value={editingPost.content.finalText || (editingPost.content.finalMedia && editingPost.content.finalMedia[0]?.caption) || ''}
            onChange={(e) => {
              const newText = e.target.value;
              setEditingPost({
                ...editingPost,
                content: {
                  ...editingPost.content,
                  finalText: newText,
                  finalMedia: editingPost.content.finalMedia ? editingPost.content.finalMedia.map((media, index) => {
                    if (index === 0) {
                      return {
                        ...media,
                        caption: newText
                      };
                    }
                    return media;
                  }) : []
                }
              });
            }}
            placeholder="Текст"
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setEditingPost(null)}>
              Отмена
            </Button>
            <Button onClick={handleSaveContent}>
              Сохранить
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <Card key={post.id} className="p-4">
              {post.content.media && (
                <div className="mb-4 grid grid-cols-2 gap-2">
                  {post.content.media.map((mediaItem, mediaIndex) => (
                    mediaItem.urls.map((url, urlIndex) => (
                      <div key={`${mediaIndex}-${urlIndex}`} className="relative aspect-video">
                        {mediaItem.type.includes('video') ? (
                          <video 
                            className="w-full h-full object-cover rounded-lg"
                            controls
                            src={url}
                          />
                        ) : (
                          <img
                            src={url}
                            alt={mediaItem.generatedDescription || `Медиа ${mediaIndex + 1}`}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        )}
                      </div>
                    ))
                  ))}
                </div>
              )}
              <p className="text-sm text-gray-600 mt-2">{post.content?.finalText || post.content?.finalMedia[0].caption}</p>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setEditingPost(post)}>
                  Редактировать
                </Button>
                <Button variant="destructive" onClick={() => handleReject(post.id)}>
                  Отклонить
                </Button>
                <Button onClick={() => handleApprove(post.id)}>
                  Одобрить
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 